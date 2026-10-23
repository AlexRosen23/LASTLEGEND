"""Offline source parser checks: no invented jersey, height or weight."""
import importlib.util
import pathlib
import unittest
from unittest.mock import patch

MODULE = pathlib.Path(__file__).resolve().parents[1] / "tools" / "sync_active_rosters_v24.py"
spec = importlib.util.spec_from_file_location("roster_sync", MODULE)
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

class TestRosterMeasurements(unittest.TestCase):
    def test_numeric_measurements(self):
        self.assertEqual(sync.physical_measurements({"height": 77, "weight": 242}), (77, 242))
        self.assertEqual(sync.physical_measurements({"height": 0, "weight": 9999}), (None, None))

    def test_display_fallback(self):
        self.assertEqual(sync.physical_measurements({"displayHeight": "6' 7\"", "displayWeight": "220 lbs"}), (79, 220))
        self.assertEqual(sync.physical_measurements({"displayHeight": "5 ft 11 in", "displayWeight": "185 lb"}), (71, 185))
        self.assertEqual(sync.physical_measurements({"displayHeight": "unknown", "displayWeight": "unknown"}), (None, None))

    def test_valid_jersey(self):
        for value in ("0", "00", "7", "99"):
            self.assertEqual(sync.valid_jersey(value), value)
        for value in (None, "", "TBD", "100", "-2", "11/12"):
            self.assertIsNone(sync.valid_jersey(value))

    def test_capture_excludes_birthdays_and_photos(self):
        player = {
            "id": "5", "fullName": "Fixture Athlete", "jersey": "00",
            "height": 76, "weight": 204, "dateOfBirth": "2000-01-01",
            "headshot": {"href": "https://example.invalid/photo.jpg"},
            "position": {"displayName": "Guard"},
            "status": {"type": "active"},
            "links": [],
        }
        row = sync.roster_entry(player, {"id": 7, "displayName": "Sample Team", "abbreviation": "SMP"}, "NBA", "2026-27")
        self.assertEqual(row["jersey"], "00")
        self.assertEqual((row["heightInches"], row["weightLbs"]), (76, 204))
        self.assertNotIn("dateOfBirth", row)
        self.assertNotIn("headshot", row)
        self.assertNotIn("age", row)

    def test_secondary_jersey_requires_same_team(self):
        base = {"id":"42","teamId":"7","jersey":None,
                "jerseySource":None,"heightInches":None,"weightLbs":None}
        def response(team_id):
            return {"athlete": {"team": {"id": team_id}, "jersey": "36", "height": 74, "weight": 210}}
        with patch.object(sync, "get_json", return_value=response("9")):
            self.assertFalse(sync.enrich_missing_jersey(base, "football", "nfl", 0))
        self.assertIsNone(base["jersey"])
        self.assertIsNone(base["heightInches"])
        with patch.object(sync, "get_json", return_value=response("7")):
            self.assertTrue(sync.enrich_missing_jersey(base, "football", "nfl", 0))
        self.assertEqual((base["jersey"],base["heightInches"],base["weightLbs"]), ("36",74,210))
        self.assertEqual(base["jerseySource"],"ESPN matching-team athlete profile")

    def test_missing_secondary_data_does_not_guess(self):
        base = {"id":"42","teamId":"7","jersey":None,
                "jerseySource":None,"heightInches":None,"weightLbs":None}
        with patch.object(sync, "get_json", return_value={"athlete": {"team": {"id": "7"}, "jersey": None}}):
            self.assertFalse(sync.enrich_missing_jersey(base, "football", "nfl", 0))
        self.assertIsNone(base["jersey"])

if __name__ == "__main__":
    unittest.main()
