# Local Ollama models: repository access and safe edits

This guide covers developer tooling that lets the models installed in this PC's Ollama read this repository and propose edits. It is separate from the [visitor chatbot plan](./OLLAMA_CHATBOT_GUIDE.md): nothing here is published, exposed to the network, or used by the website.

Ollama models cannot open files by themselves. [ollama_bridge.py](../scripts/ollama_bridge.py) gives them controlled access: models with tool calling get file tools, and text-only models receive the relevant files in the prompt and answer with edit blocks. Every edit is staged first. After you review it, `apply` writes it, runs `manage.py check` and `build.py`, and restores the files automatically if either fails. The script uses only the Python standard library and talks only to Ollama on `127.0.0.1`.

## 1. What is installed on this PC

| Item | Location | Notes |
| --- | --- | --- |
| Ollama | `http://127.0.0.1:11434` | Desktop app; listens on loopback only |
| Project Python | `.venv\Scripts\python.exe` | Python 3.12 with Django and Markdown from `requirements.txt` |
| Bridge | [scripts/ollama_bridge.py](../scripts/ollama_bridge.py) | Read-only for the models |
| Settings | [scripts/ollama_bridge.json](../scripts/ollama_bridge.json) | Default model, context size, file policy, validation commands |
| Sessions | `.ollama-bridge/` | Staged edits, rollback backups, transcripts and probe results; git-ignored |
| VS Code tasks | `.vscode/tasks.json` | **Terminal > Run Task > Ollama: ...**; local to this PC because `.vscode/` is git-ignored |

Check the setup at any time:

```powershell
.\.venv\Scripts\python.exe scripts\ollama_bridge.py doctor
```

`doctor` confirms that Ollama runs and listens only on loopback. It also lists the models, shows which model is loaded, and checks the project interpreter and the `.gitignore` entry.

## 2. Local models and how they are used

Every model in `ollama list` is available, including models you pull later. `models` lists them with the mode the bridge chooses from each model's capabilities:

```powershell
.\.venv\Scripts\python.exe scripts\ollama_bridge.py models
```

| Model | Size | Bridge mode | Verified during setup |
| --- | --- | --- | --- |
| `llama3.2:latest` | 1.9 GB | tools | Read and staged-edit probe passed with a clean one-line diff |
| `dolphin3:latest` | 4.6 GB | text | Read passed. Staged edit passed 3 of 3 final runs; earlier runs sometimes guessed file contents |
| `deepseek-r1:latest` | 4.9 GB | tools, thinking | Not probed yet |
| `qwen2.5:14b` (default) | 8.4 GB | tools | Not probed yet; probe it before relying on it |
| `nemotron-3.5-lightning:latest` | 23.7 GB | tools, thinking | Not probed yet |
| `nemotron-3.5-bolt:latest` | 23.1 GB | tools, thinking, vision | Not probed yet |
| `nemotron3:33b` | 25.7 GB | tools, thinking, vision | Not probed yet |

- **tools**: the model calls `list_files`, `read_file`, `search_files`, `replace_in_file`, `write_file`, `revert_file` and `show_changes`. Common alternative names such as `ls`, `grep` or `str_replace` are accepted. Prefer these models for edits.
- **text**: for models without tool calling. The bridge puts the files most relevant to the task, plus any `--file`, into the prompt, and the model answers with SEARCH/REPLACE blocks. A malformed block, or SEARCH text that does not match the file exactly, goes back to the model with the exact problem; the bridge never guesses. `--mode text` forces this mode.

The 23–26 GB models do not fit in the 16 GB GPU and run partly on the CPU, so they are slow. The setup probes ran on the CPU so that they would not unload a model another app was using.

## 3. Everyday workflow

Run these from the repository root. To shorten the commands, define a helper once per PowerShell window:

```powershell
function bridge { & .\.venv\Scripts\python.exe scripts\ollama_bridge.py @args }

bridge ask "Which file holds the hero text?"
bridge run -m llama3.2 "Change the secondary hero button text to Request a Quote"
bridge review
bridge apply
bridge rollback
```

1. `ask` answers a question using read-only tools.
2. `run` lets the model work on a task. Its edits are staged in `.ollama-bridge/sessions/<id>/`, and the working tree is untouched. At the end it prints a diff summary, validation warnings and the model's summary.

   Useful options:
   - `-m MODEL`: a unique prefix of the name is enough.
   - `-f PATH`: attach a file; repeatable.
   - `--prompt-file`: read the task from a file.
   - `--read-only`, `--ctx`, `--max-rounds`.
   - `--think`, `--no-think`, `--show-thinking`.
   - `--apply`: apply at the end; still asks unless you add `-y`.
3. `review` (or `diff`) shows the staged diff with validation errors and warnings.
4. `apply` shows the diff and asks for confirmation. It refuses if a staged file changed on disk after staging. It then writes the files, keeping their line endings and BOM, and runs `manage.py check` and `build.py`. If either fails, the files are restored and the session is marked failed. `--no-build` skips `build.py`; `--keep-on-failure` keeps the files for debugging.
5. `rollback` restores the files from the last apply and rebuilds. If you edited those files since the apply, it refuses unless you pass `--force`.
6. `discard` drops staged edits; `--all` drops every staged, empty or failed session. `sessions` lists all sessions.

Nothing is committed or pushed. Review `git diff`, preview the site, then commit yourself.

The same commands are VS Code tasks under **Terminal > Run Task**: Doctor, List local models, Ask a question, Run task, Run task on current file, Review, Apply, Roll back, Discard, Check working-tree changes, and Probe models. Choose `default` to use `default_model` from the settings. If you pull a new model, add it to the pick lists in `.vscode/tasks.json`.

## 4. Edits made outside the bridge

Chat panels, the VS Code Ollama extension and other tools write straight into the files. Validate their edits before committing:

```powershell
bridge check
```

`check` reads `git status` and inspects the changed source files. Generated `docs/` and root pages are ignored. It checks the following:

- JSON content parses, has no duplicate keys, and keeps `true`/`false` settings unquoted. `hero.image` must name an existing file.
- `content/portfolio.json` keeps project IDs, source folders, image mappings, stable slugs and a valid cover. After a real importer run, use `check --allow-import`.
- Published files (`content/`, `templates/`, `static/`) gain no drive paths, `file:` URLs, local Ollama address or external assets. No file gains a secret.
- CSS: it flags new rules that start content hidden (`opacity: 0` or `visibility: hidden`) outside an animation, `animation` declarations browsers ignore, and duplicated `@keyframes`. Without these checks, content can disappear when motion is off, reduced motion is on, or JavaScript is unavailable.
- Changes outside the model-writable areas, and new `requirements.txt` packages, are flagged for manual review.

It then runs `manage.py check` and `build.py`; add `--no-build` for a quick static check. Exit code 1 means a problem was found. Warnings don't fail the check, but read them.

## 5. What the models can read and change

| Access | Paths |
| --- | --- |
| Hidden | `.git`, `.venv`, `.ollama-bridge`, `__pycache__`, `.env*`, keys and certificates, `docs/`, `temp/`, legacy Jekyll folders |
| Read-only | `scripts/`, `.github/`, `.vscode/`, `AGENTS.md`, `CLAUDE.md`, `build.py`, `manage.py`, `requirements.txt`, `.gitignore`, generated root pages |
| Editable (staged) | Text files in `content/`, `templates/`, `static/css/`, `static/js/`, `documentation/`, plus `README.md` |

Images and other binary files cannot be edited; photos go through the [image importer](./IMAGE_UPDATE_AND_DEPLOYMENT_GUIDE.md). Paths must stay inside the repository: `..`, absolute paths, links, junctions and reserved Windows names are refused. Each edit is validated as it is staged. An invalid edit is rejected with the reason, and warnings go back to the model so it can correct itself.

`read_deny`, `write_allow` and `write_deny` in the settings adjust the policy, but the fixed rules above always win.

The system prompt includes [AGENTS.md](../AGENTS.md), so the local models follow the same project rules as other coding agents. Instructions are guidance, not a sandbox; the real safeguards are the file policy, validation and your review.

## 6. Safety rules

- Keep Ollama on loopback. Do not set `OLLAMA_HOST=0.0.0.0` or allow network access in the Ollama app. `doctor` fails if Ollama listens on a network address, and the bridge refuses a non-loopback `ollama_url`.
- No API keys, accounts or external services are involved. Prompts and files stay on this PC.
- Treat model output as untrusted data. Check business facts, client names and claims in visible text before publishing. The bridge strips terminal control characters from model output.
- The bridge never commits, pushes or deploys.

## 7. Settings, memory and speed

Settings live in [scripts/ollama_bridge.json](../scripts/ollama_bridge.json); keys starting with `_` are notes.

| Key | Default | Meaning |
| --- | --- | --- |
| `default_model` | `qwen2.5:14b` | Used when `-m` is omitted |
| `context_tokens` | 32768 | Context window requested per call, capped at the model's maximum; larger needs more memory |
| `max_output_tokens` | 8192 | Longest single reply |
| `max_tool_rounds` | 40 | Model turns per run |
| `request_timeout_seconds` | 900 | Timeout per request |
| `keep_alive` | `10m` | How long Ollama keeps the model loaded after a run |
| `options`, `model_options` | `{}` | Ollama options for every model, or for one model by its full name |
| `validate_commands` | `manage.py check`, `build.py` | Run by `apply` and `check`; `{python}` is the project interpreter |

- Only one large model fits in GPU memory. A bridge run can unload a model that another app keeps loaded, and the reverse. To leave the GPU to the other app, run a model on the CPU, at a cost in speed: `"model_options": {"llama3.2:latest": {"num_gpu": 0}}`.
- The Ollama server's default context (4096 tokens on this PC) applies only to clients that don't request a size. The bridge always requests one.
- Thinking models reason before answering by default. `--no-think` is faster, and `--show-thinking` prints the reasoning.

## 8. Testing which models work

```powershell
bridge probe -m llama3.2 --write
bridge probe --write
```

The second command probes every model, which takes a long time for the large ones.

- **Read test:** asks for the site title.
- **Write test:** asks the model to change the secondary hero button text in `content/config.json` from `Get a Quote` to `Request a Quote`, then checks that nothing else changed. The edit is staged in memory only and never written.

Results are saved to `.ollama-bridge/probe-results.json` and shown in the PROBE column of `models`. Models loaded only for the probe are unloaded afterwards. Probe when no other app needs the GPU, because Ollama may unload that app's model to make room.

## 9. Troubleshooting

| Symptom | What to do |
| --- | --- |
| `Cannot reach Ollama at http://127.0.0.1:11434` | Start the Ollama app, then rerun `doctor` |
| Model does not support tools | The bridge switches to text mode automatically |
| `old_text was not found`, or a SEARCH block does not match | The model must copy text exactly; it gets the error and retries. If it keeps failing, use a tools model or a narrower task with `-f` |
| `apply` refuses because a file changed on disk | Something edited the file after staging. Run `discard`, then run the task again |
| `build.py` reports `Access is denied` while replacing `docs/` | OneDrive marks folders read-only, and `build.py` clears the flag and retries. If the error persists, pause OneDrive sync and build again |
| Very slow replies | Use a smaller model, lower `context_tokens`, or close other apps that use the GPU |
| Garbled characters in the terminal | Run `$env:PYTHONUTF8 = '1'` first; the VS Code tasks already set it |
