# Roam — Slack Group Planning Agent

**OpenAI + CopilotKit Channels + Exa**

**Roam** is an autonomous group planning and arbitration assistant that lives directly inside Slack channels and threads. It reads conversation dynamics, balances member preferences, designs itineraries with Google Calendar integration, and splits expenses using vision-based receipt/ticket extraction.

---

## 📸 Live Roam Screenshots

### 1. ✈️ Multi-Day Travel Planning & Native Itinerary Cards
Mentioning `@roam` with destination and group constraints immediately generates a customized multi-day travel card with group members, budget estimations, and an interactive itinerary table with one-click Google Calendar scheduling:

![Roam 3-Day Osaka Trip Itinerary Card in Slack](../../assets/screenshots/roam-travel-itinerary.png)

### 2. 💸 Multimodal Ticket & Receipt Bill Splitting
Uploading an e-ticket, invoice, or receipt image in Slack triggers vision inspection. Roam extracts line items, totals, and currency (e.g. AED), computing fair per-person splits and settlement instructions directly in thread:

![Roam Multimodal Ticket Bill Split in Slack](../../assets/screenshots/roam-ticket-billsplit.png)

---

## Get started

Complete the [root clone/install steps](../../README.md#get-started), then configure `.env` with [OpenAI](../../using-sponsor-tools.md#openai), [CopilotKit Intelligence](../../using-sponsor-tools.md#copilotkit), and [Exa](../../using-sponsor-tools.md#exa):

```dotenv
MODEL_PROVIDER=openai
OPENAI_API_KEY=your-key
MODEL=gpt-5.6-sol
CHANNEL_CODE=your-channel-code
INTELLIGENCE_API_KEY=your-project-key
EXA_API_KEY=your-key
EXA_SEARCH_TYPE=fast
```

Choose an OpenAI model available to your account. Create the managed Channel using `npm run channel:setup`; the [setup guide](../../dev-docs/setup.md) and [screenshot walkthrough](../../dev-docs/channels-sdk-walkthrough/README.md) cover the Slack installation.

```bash
npm run dev:slack
```

Invite the bot to a Slack channel and mention it in a populated thread. CopilotKit Intelligence manages the Slack connection; this listener needs no public tunnel or Slack app token on the managed path.

## Try the flow

1. Add two or three facts to a Slack thread before mentioning the agent.
2. Ask it to catch up using the thread and render a card. Verify facts came from earlier messages rather than your last prompt.
3. Ask it to research a related question with Exa. `search_web` posts native **Search sources** cards when sources are returned; open the links and separate published evidence from facts in your thread.
4. Ask a follow-up that relies on the discussion. Check the answer and card remain in the same thread.

Use [demo prompts](../../dev-docs/demo-prompts.md#slack-context-sources-card-follow-up) for exact incident inputs. If you add an external write, enforce approval in code before that write. The included proposal card records a decision without executing a production action.

## Customize these files

| Piece | File |
|---|---|
| Agent and model | [Shared agent factory](../../packages/agent-core/src/agent.ts), using CopilotKit's built-in agent |
| Channel lifecycle | [src/channel.tsx](src/channel.tsx): mention, subscribe, respond to subscribed messages |
| Channel-only run adapter | [src/agent.ts](src/agent.ts): keeps outer transcript/state while using fresh inner agent runs |
| Thread context and research | [src/tools.tsx](src/tools.tsx) and [src/search.tsx](src/search.tsx): `read_thread` and Exa-backed `search_web` |
| Native cards | [src/components.tsx](src/components.tsx): incident card and timeline via Channels JSX |
| Prompt | [Shared prompt](../../packages/agent-core/src/prompt.ts) |

OpenRouter can be used as the model gateway through the shared provider settings in [using-sponsor-tools.md](../../using-sponsor-tools.md#openrouter). Teams or another messaging platform can reuse the Channels pattern, but this starter app is wired for managed Slack.

## Give this to your coding agent

```text
Read the root hackathon overview, rules, sponsor guide, and AGENTS.md.
Read .agents/skills/build-channels-agent/SKILL.md before changing Slack code.
Adapt apps/channel to our project's user and conversation. Preserve
read_thread, use Exa when research helps, and render results with Channels JSX.
Replace incident-specific schemas, tools, and prompts with our own workflow.
Demonstrate that earlier messages change the answer and return source links.
Run npm run verify and document the live Slack checks separately.
```

## Verify and limits

Run `npm run verify` for root/channel typechecks and offline tests. Live Slack delivery, Exa search, and model responses require your own accounts and should be documented separately from local tests.

Keep the pinned Channels/runtime pair and the `@ag-ui/client` override. The [Channels skill](../../.agents/skills/build-channels-agent/SKILL.md) supplies the verified API vocabulary. [Channels guide](https://copilotkit.ai/channels-guide.md) · [OpenTag reference app](https://github.com/CopilotKit/OpenTag)
