import importlib.util
import unittest
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src-tauri/resources/argos_direct_router.py'
spec=importlib.util.spec_from_file_location('argos_direct_router',p)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
class TestRouting(unittest.TestCase):
 def test_same_language_bypasses_models(self):
  self.assertEqual(module.plan(set(),'en','en'),'same')
  self.assertEqual(module.plan(set(),'vi','vi'),'same')
 def test_direct_wins_even_when_pivot_also_installed(self):
  pairs={('pt','es'),('pt','en'),('en','es')}
  self.assertEqual(module.plan(pairs,'pt','es'),'direct')
 def test_installed_pivot_before_whisper_fallback(self):
  self.assertEqual(module.plan({('zh','en'),('en','vi')},'zh','vi'),'pivot')
 def test_whisper_fallback_only_when_direct_and_pivot_absent(self):
  self.assertEqual(module.plan({('en','vi')},'zh','vi'),'whisper')
  self.assertEqual(module.plan(set(),'zh','en'),'whisper')
 def test_missing_model_is_not_falsely_declared_ready(self):
  self.assertEqual(module.plan(set(),'zh','vi'),'needs-model')
if __name__=='__main__':
 unittest.main()
