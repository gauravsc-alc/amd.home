# Connect the website to your locally running Ollama server

## Current status

This document is an implementation plan. The website does **not** yet contain a chatbot widget, an `/api/chat` endpoint, or a public tunnel. Adding configuration alone will not enable a chatbot. Keep the existing image, portfolio, and deployment workflow unchanged while implementing the separate chat service.

GitHub Pages serves static files; your local Ollama process and a live backend must run separately. Never configure a public website to call `http://localhost:11434`: localhost would refer to each visitor's computer, not yours.

## Architecture

```text
Visitor's browser (GitHub Pages, HTTPS)
    -> HTTPS chat gateway /api/chat
    -> local Ollama at http://127.0.0.1:11434/api/chat
    -> gateway returns only the assistant's text
```

Run the gateway on your computer alongside Ollama. Reach it through an HTTPS reverse proxy or a carefully configured tunnel. Expose only the gateway, not Ollama itself. If your computer sleeps, loses connectivity, or stops either process, visitors must see an unavailable message and the normal contact link.

## 1. Verify local inference first

Install Ollama from its official site and start its desktop application. Use `ollama serve` only if a server is not already listening; otherwise a port conflict is expected.

In PowerShell:

```powershell
ollama list
```

Choose a locally installed model suitable for your hardware. If necessary, download your chosen model with `ollama pull MODEL_NAME` first. Substitute its exact name below:

```powershell
$model = 'REPLACE_WITH_INSTALLED_MODEL_NAME'
$body = @{
  model = $model
  messages = @(
    @{ role = 'user'; content = 'What information should I prepare for an interior design consultation?' }
  )
  stream = $false
} | ConvertTo-Json -Depth 6

$response = Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/chat' `
  -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 90
$response.message.content
```

Ollama's chat response places the assistant answer in `message.content`. Explicitly use `stream: false` for an initial integration; streaming requires different response handling. These commands test Ollama only, not a website chat endpoint.

## 2. Implement a gateway, not a direct browser connection

You can add a live Django API application, but it must run as a separate server deployment, not inside the generated GitHub Pages HTML. Keep the site renderer and its static build working without Ollama running.

Define the gateway contract:

```text
POST https://YOUR_CHAT_DOMAIN/api/chat
Content-Type: application/json

Request:  {"message": "Can you design my kitchen?"}
Success:  {"reply": "Please share your room dimensions and preferred style..."}
Failure:  {"error": "Chat is temporarily unavailable. Please contact us directly."}
```

The gateway must:

1. Accept POST only, validate JSON, require a nonempty string, and cap message length (for example 2,000 characters) and request body size. Reject client-supplied model names, system prompts, arbitrary URLs, or inference options.
2. Select a model through a server environment variable and call the fixed local Ollama address. Do not construct a destination URL from user input.
3. Supply a server-controlled system prompt describing Ashapura Maison Design, verified services and contact information, and instructions not to invent prices, bookings, completion dates, or business policies. Treat chat content as untrusted input; do not enable tools, filesystem access, or command execution.
4. Set bounded generation output and concurrency. Set an upstream timeout appropriate to your machine; test a cold model as well as a loaded model. Return safe error responses rather than raw upstream errors or stack traces.
5. Return only the assistant reply. Limit requests per session/IP and globally, and limit maximum input/output size. Return HTTP 429 for rate limits, 400 for bad input, and 503 for unavailable inference.
6. If history is added later, cap its length and token budget. Keep conversations isolated by authenticated user or an unguessable server-managed session identifier. Do not accept client-supplied `system` or `tool` messages.

Suggested gateway-owned environment settings (these are proposed settings for your future code, not existing project configuration or built-in Ollama settings):

```text
CHAT_OLLAMA_URL=http://127.0.0.1:11434
CHAT_MODEL=YOUR_INSTALLED_MODEL_NAME
CHAT_ALLOWED_ORIGIN=https://gauravsc-alc.github.io
CHAT_REQUEST_TIMEOUT_SECONDS=60
```

Use the site's actual origin. An origin contains scheme and host, not the `/amd.home/` repository path. CORS cannot distinguish two repositories served under the same GitHub Pages origin; a dedicated custom domain provides a narrower origin boundary.

## 3. Publish the gateway safely

- Keep Ollama bound to loopback. Its local API does not require authentication; do not forward port 11434 to the internet or expose it through an unauthenticated tunnel.
- Bind the gateway privately and publish only its intended chat route through HTTPS. Do not expose Django debug pages, admin routes, or Ollama model-management endpoints.
- Use a production server configuration with debug mode off, restricted hosts, secrets in environment variables, and trusted proxy settings appropriate to your deployment.
- For a private demo, require authentication at the gateway or tunnel. For anonymous public chat, add abuse controls such as rate limits, bot challenges, concurrency limits, and an operator kill switch. A public API key embedded in JavaScript is not a secret or meaningful protection.
- Allow only the intended website origin, methods, and headers in gateway CORS responses, including preflight OPTIONS. CORS is not authentication. If cookie-based sessions are used, retain CSRF protection and configure credentials explicitly; do not simply exempt every endpoint.
- Avoid logging user message contents by default. Display a privacy notice explaining where requests are processed, what is retained, and that chat does not submit an enquiry or confirm a booking.

`OLLAMA_ORIGINS` controls browser origins accepted by Ollama itself. It is not needed for the preferred server-to-server gateway design and is not an authentication mechanism. Do not set it to `*` to solve public access problems. Configure CORS on your gateway instead.

## 4. Add the website widget after the gateway works

The required code changes are still to be implemented:

- Add a `chatbot` configuration object with an enable switch and HTTPS gateway URL.
- Add a template with an accessible chat launcher, labelled input, send/close buttons, and a polite live region for responses.
- Add a frontend script that sends the message to the gateway, prevents duplicate submissions, and shows loading, timeout, rate-limit, and offline states.
- Use `textContent` for model replies, never unsanitized HTML. Do not expose credentials, allow model output to run JavaScript, or open arbitrary links automatically.
- Use a bounded client timeout slightly longer than the gateway timeout. Do not retry repeatedly when the local computer is offline.
- Keep navigation, gallery, and contact links usable if the chatbot is disabled or fails.

Start with non-streaming replies and a single message per request. Add bounded conversation history or streaming only after the simple path is reliable. The generated static site needs only the public gateway URL; it must not contain local filesystem paths, server secrets, or the private Ollama address.

## 5. Acceptance checklist

- Local command returns an answer from the intended installed model.
- An external phone/network can reach the HTTPS gateway, while raw Ollama and management endpoints remain inaccessible.
- Allowed-origin requests work; disallowed browser origins fail CORS. Separate authentication/abuse controls also work against direct API clients.
- Empty, oversized, malformed, and unsupported requests are rejected predictably.
- Rate limits and concurrent requests do not overload the computer.
- Stopping Ollama, stopping the gateway, or putting the machine offline produces a friendly fallback with contact details.
- A reply containing HTML is displayed as text, not executed.
- Keyboard and mobile users can open, use, and close the widget; focus returns to its launcher.
- No sensitive prompts, API keys, or chat transcripts are committed to Git.

## Official references

- [Ollama chat API and response format](https://docs.ollama.com/api/chat)
- [Ollama local API authentication behavior](https://docs.ollama.com/api/authentication)
- [Ollama networking, environment variables, and browser origins](https://docs.ollama.com/faq)

No server, model download, or public network exposure is performed by following the website's normal static build.
