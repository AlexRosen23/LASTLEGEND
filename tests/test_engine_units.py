"""Unit tests for the engine's pure helpers (draw, choose, bounded, narrative) and the CLI."""
import contextlib, io, json, sys, tempfile, unittest
from pathlib import Path
from unittest import mock

from engine import cli
from engine.simulation import bounded, choose, draw, logistic, narrative


class Draw(unittest.TestCase):
    def test_stable_and_in_unit_interval(self):
        self.assertEqual(draw(7, 'a', 1), draw(7, 'a', 1))
        for i in range(200):
            self.assertTrue(0 <= draw(i, 'x') < 1)

    def test_every_part_changes_the_draw(self):
        base = draw(7, 'a', 1)
        self.assertNotEqual(base, draw(8, 'a', 1))
        self.assertNotEqual(base, draw(7, 'b', 1))
        self.assertNotEqual(base, draw(7, 'a', 2))

    def test_versioned_pinned_value(self):
        # Pins the hash scheme ('v0.2|seed|parts' -> sha256 -> first 8 bytes); changing it silently breaks recorded replays.
        self.assertAlmostEqual(draw(1, 'a'), 0.0561235970137631, places=12)
        self.assertAlmostEqual(draw(1, 'a', 'b'), 0.35501116573466057, places=12)
        self.assertNotEqual(draw(1, 'a', 'b'), draw(1, 'ab'))  # parts are '|'-separated


class Bounded(unittest.TestCase):
    def test_clamps_both_ends(self):
        self.assertEqual(bounded(-5), 0)
        self.assertEqual(bounded(150), 100)
        self.assertEqual(bounded(42), 42)
        self.assertEqual(bounded(5, -1, 3), 3)

    def test_logistic_is_clamped_away_from_certainty(self):
        self.assertEqual(logistic(100000, 0, 1), .975)
        self.assertEqual(logistic(0, 100000, 1), .025)


class Choose(unittest.TestCase):
    def test_single_item_always_wins(self):
        self.assertEqual(choose(1, 1, 'a', 0, [('only', 3)]), 'only')

    def test_deterministic(self):
        items = [('a', 1), ('b', 1), ('c', 1)]
        self.assertEqual(choose(5, 2, 'x', 'slot', items), choose(5, 2, 'x', 'slot', items))

    def test_weight_floor_keeps_zero_weight_items_legal(self):
        picks = {choose(s, 0, 'a', 0, [('hi', 1), ('zero', 0)]) for s in range(200)}
        self.assertEqual(picks, {'hi'})  # floor is 1e-5: effectively never chosen, never crashes

    def test_heavier_weight_wins_more_often(self):
        items = [('light', 1), ('heavy', 9)]
        picks = [choose(s, 0, 'a', 0, items) for s in range(1000)]
        heavy = picks.count('heavy')
        self.assertGreater(heavy, 800)
        self.assertLess(heavy, 980)


LOOKUP = {'a': {'display_name': 'Ann'}, 'b': {'display_name': 'Bo'}}


def ev(t, parts=(), **details):
    return {'type': t, 'participants': list(parts), 'details': details}


class Narrative(unittest.TestCase):
    def test_elimination_by_athlete_and_by_arena(self):
        by = narrative(ev('ELIMINATION', eliminated='a', source='b', reason='ZONE_EXPOSURE'), LOOKUP)
        self.assertEqual(by, 'Ann is eliminated by Bo (zone exposure).')
        arena = narrative(ev('ELIMINATION', eliminated='a', source='zone', reason='COLD'), LOOKUP)
        self.assertEqual(arena, 'Ann is eliminated by arena pressure (cold).')

    def test_chase_outcomes(self):
        esc = narrative(ev('CHASE', fleeing='a', pursuing='b', escaped=True), LOOKUP)
        caught = narrative(ev('CHASE', fleeing='a', pursuing='b', escaped=False), LOOKUP)
        self.assertEqual(esc, 'Ann escapes from Bo.')
        self.assertEqual(caught, 'Ann is caught by Bo.')

    def test_unknown_id_falls_back_to_raw_id(self):
        self.assertEqual(narrative(ev('ALLIANCE', ['a', 'zz']), LOOKUP),
                         'Ann and zz agree to a temporary alliance.')

    def test_unknown_type_uses_generic_template(self):
        self.assertEqual(narrative(ev('SOME_NEW'), LOOKUP), 'A some new event occurs.')

    def test_match_start_and_champion(self):
        self.assertEqual(narrative(ev('MATCH_START', arena='CITY'), LOOKUP),
                         'The twelve competitors enter the city arena.')
        self.assertIn('Ann is the sole survivor', narrative(ev('CHAMPION', winner='a'), LOOKUP))

    def test_skirmish_reports_damage_target(self):
        s = narrative(ev('SKIRMISH', attacker='a', defender='b', injury_target='b', damage=12), LOOKUP)
        self.assertEqual(s, 'Ann and Bo clash. Bo takes 12 game damage.')


class Cli(unittest.TestCase):
    def run_cli(self, *argv):
        out = io.StringIO()
        with mock.patch.object(sys, 'argv', ['engine.cli', *argv]), contextlib.redirect_stdout(out):
            cli.main()
        return json.loads(out.getvalue())

    def test_batch_over_limit_is_rejected(self):
        with mock.patch.object(sys, 'argv', ['engine.cli', '--batch', '10001']):
            with self.assertRaises(ValueError):
                cli.main()

    def test_ids_requires_exactly_twelve(self):
        with mock.patch.object(sys, 'argv', ['engine.cli', '--ids', 'a', 'b']), \
                contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit):
                cli.main()

    def test_single_match_is_deterministic_and_writes_story(self):
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / 'm.json'
            a = self.run_cli('--seed', '42', '--out', str(path))
            b = self.run_cli('--seed', '42')
            self.assertEqual(a['hash'], b['hash'])
            self.assertIn(a['winner_id'], cli.DEFAULT)
            saved = json.loads(path.read_text())
            self.assertTrue(all('story' in e for e in saved['events']))
            self.assertEqual(saved['winner'], a['winner_id'])

    def test_batch_summary_adds_up(self):
        s = self.run_cli('--seed', '1', '--batch', '3', '--max-ticks', '60')
        self.assertEqual(s['matches'], 3)
        self.assertEqual(sum(s['wins'].values()), 3)
        self.assertAlmostEqual(sum(s['win_rates'].values()), 1.0, places=3)


if __name__ == '__main__':
    unittest.main()
