"""Offline checks for tools/pages_deploy.py, the main -> gh-pages game-file copy (docs/DEPLOY.md)."""
import importlib.util
import pathlib
import shutil
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("pages_deploy", ROOT / "tools" / "pages_deploy.py")
pages = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pages)


def fake_source(base: pathlib.Path, index_html: str) -> pathlib.Path:
    src = base / "main"
    (src / "ui").mkdir(parents=True)
    (src / "data").mkdir()
    (src / "index.html").write_text(index_html)
    (src / "identity-lab.html").write_text('<script>fetch("./data/roster_v4.json")</script>')
    (src / "data" / "roster_v4.json").write_text("{}")
    (src / "ui" / "game.js").write_text("// new module")
    return src


class TestRealSite(unittest.TestCase):
    def test_every_page_reference_is_in_the_deploy_list(self):
        self.assertEqual(pages.check(ROOT), [])

    def test_references_include_modules_pages_and_data(self):
        refs = pages.referenced_paths(ROOT)
        self.assertIn("ui/active-rosters-v24.js", refs)
        self.assertIn("ui/website-v8.css", refs)
        self.assertIn("identity-lab.html", refs)
        self.assertIn("data/roster_v4.json", refs)
        self.assertIn("data/active_rosters_v24.json", refs)
        self.assertFalse(any(r.startswith(("http", "#", "/")) for r in refs), refs)


class TestDeploy(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp)

    def make_site(self) -> pathlib.Path:
        site = self.tmp / "gh-pages"
        for rel, text in {
            "index.html": "old game",
            "ui/game.js": "// old module",
            "ui/removed-on-main.js": "// gone",
            "data/active_rosters_v24.json": '{"from":"roster sync"}',
            "preview-v9/index.html": "frozen preview",
        }.items():
            (site / rel).parent.mkdir(parents=True, exist_ok=True)
            (site / rel).write_text(text)
        return site

    def test_copies_game_files_and_keeps_what_other_publishers_own(self):
        src = fake_source(self.tmp, '<script src="ui/game.js"></script><a href="identity-lab.html">lab</a>')
        site = self.make_site()
        changed = pages.deploy(src, site)
        self.assertEqual((site / "index.html").read_text(), (src / "index.html").read_text())
        self.assertEqual((site / "ui" / "game.js").read_text(), "// new module")
        self.assertFalse((site / "ui" / "removed-on-main.js").exists(), "ui/ is mirrored from main")
        self.assertEqual((site / "data" / "active_rosters_v24.json").read_text(), '{"from":"roster sync"}')
        self.assertEqual((site / "preview-v9" / "index.html").read_text(), "frozen preview")
        self.assertTrue((site / ".nojekyll").exists())
        self.assertEqual(
            sorted(changed),
            sorted(["index.html", "identity-lab.html", "data/roster_v4.json", "ui/game.js",
                    "ui/removed-on-main.js", ".nojekyll"]),
        )
        self.assertEqual(pages.deploy(src, site), [], "a second deploy changes nothing")

    def test_blocks_a_page_reference_the_deploy_would_miss(self):
        src = fake_source(self.tmp, '<img src="assets/logo.png"><script src="ui/game.js"></script>')
        self.assertEqual(pages.check(src), ["referenced by the site but not in the deploy list: assets/logo.png"])
        site = self.make_site()
        with self.assertRaises(SystemExit):
            pages.deploy(src, site)
        self.assertEqual((site / "index.html").read_text(), "old game", "nothing copied when blocked")

    def test_ignores_external_and_in_page_links(self):
        src = fake_source(
            self.tmp,
            '<a href="https://example.com/x.js"></a><a href="#/play"></a><link href="//cdn.example/x.css">'
            '<a href="mailto:x@example.com"></a><script src="./ui/game.js"></script>',
        )
        self.assertEqual(pages.check(src), [])

    def test_refuses_to_deploy_onto_the_source(self):
        src = fake_source(self.tmp, "")
        with self.assertRaises(SystemExit):
            pages.deploy(src, src)


if __name__ == "__main__":
    unittest.main()
