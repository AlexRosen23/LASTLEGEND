"""Offline checks for the season-aware roster-size guard in the V24 sync."""
import datetime as dt
import importlib.util
import pathlib
import unittest

MODULE = pathlib.Path(__file__).resolve().parents[1] / "tools" / "sync_active_rosters_v24.py"
spec = importlib.util.spec_from_file_location("roster_sync_guard", MODULE)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def mlb(**overrides):
    """30 clubs with typical off-season 40-man-sized lists, plus overrides."""
    counts = {f"Club {i:02}": 38 for i in range(30)}
    counts.update(overrides)
    return counts


class TestSeasonWindow(unittest.TestCase):
    def test_mlb_offseason_wraps_new_year(self):
        for day in ("2026-10-20", "2026-10-30", "2026-11-03", "2026-12-31", "2027-01-15", "2027-02-18"):
            self.assertTrue(sync.is_offseason("MLB", dt.date.fromisoformat(day)), day)
        for day in ("2026-02-19", "2026-04-01", "2026-07-15", "2026-10-19"):
            self.assertFalse(sync.is_offseason("MLB", dt.date.fromisoformat(day)), day)

    def test_espn_offseason_type_counts(self):
        self.assertTrue(sync.is_offseason("MLB", dt.date(2026, 6, 1), season_type=4))
        self.assertFalse(sync.is_offseason("MLB", dt.date(2026, 6, 1), season_type=2))

    def test_other_leagues_have_no_offseason_relaxation(self):
        for code in ("NBA", "NFL", "NHL"):
            self.assertFalse(sync.is_offseason(code, dt.date(2026, 11, 3)))
            self.assertFalse(sync.is_offseason(code, dt.date(2026, 7, 15), season_type=4))


class TestRosterSizeGuard(unittest.TestCase):
    def test_in_season_floor_is_unchanged(self):
        failures, notices = sync.roster_size_failures("MLB", mlb(**{"Milwaukee Brewers": 25}), offseason=False)
        self.assertEqual(failures, ["MLB:Milwaukee Brewers:only 25 athletes"])
        self.assertEqual(notices, [])
        failures, _ = sync.roster_size_failures("MLB", mlb(**{"Milwaukee Brewers": 26}), offseason=False)
        self.assertEqual(failures, [])

    def test_2026_world_series_club_after_free_agency(self):
        # Observed 2026-10-30..11-03: Milwaukee 20 (World Series 26-man list minus six free agents).
        counts = mlb(**{"Milwaukee Brewers": 20, "Kansas City Royals": 33})
        failures, notices = sync.roster_size_failures("MLB", counts, offseason=True)
        self.assertEqual(failures, [])
        self.assertEqual(len(notices), 1)
        self.assertIn("Milwaukee Brewers lists 20", notices[0])
        # The same list still fails in season.
        failures, _ = sync.roster_size_failures("MLB", counts, offseason=False)
        self.assertEqual(failures, ["MLB:Milwaukee Brewers:only 20 athletes"])

    def test_offseason_still_fails_a_collapsed_team_feed(self):
        for size in (0, 3, 14):
            failures, _ = sync.roster_size_failures("MLB", mlb(**{"Milwaukee Brewers": size}), offseason=True)
            self.assertEqual(len(failures), 1, size)
            self.assertIn(f"only {size} athletes", failures[0])

    def test_offseason_still_fails_when_many_clubs_shrink(self):
        counts = mlb(**{f"Club {i:02}": 20 for i in range(5)})
        failures, _ = sync.roster_size_failures("MLB", counts, offseason=True)
        self.assertEqual(failures, ["MLB:5 clubs under 26 athletes (off-season allows 4)"])
        counts = mlb(**{f"Club {i:02}": 20 for i in range(4)})
        self.assertEqual(sync.roster_size_failures("MLB", counts, offseason=True)[0], [])

    def test_offseason_still_fails_a_league_wide_regression(self):
        # e.g. the feed switching every club to a short list
        counts = {f"Club {i:02}": (40 if i < 12 else 22) for i in range(30)}
        failures, _ = sync.roster_size_failures("MLB", counts, offseason=True)
        self.assertIn("MLB:median roster 22 < 26", failures)

    def test_other_leagues_keep_strict_floor(self):
        failures, _ = sync.roster_size_failures("NBA", {"Team A": 15, "Team B": 11}, offseason=False)
        self.assertEqual(failures, ["NBA:Team B:only 11 athletes"])


if __name__ == "__main__":
    unittest.main()
