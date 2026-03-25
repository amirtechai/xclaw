# MiniMax (XClaw plugin)

Bundled MiniMax plugin for both:

- API-key provider setup (`minimax`)
- Coding Plan OAuth setup (`minimax-portal`)

## Enable

```bash
xclaw plugins enable minimax
```

Restart the Gateway after enabling.

```bash
xclaw gateway restart
```

## Authenticate

OAuth:

```bash
xclaw models auth login --provider minimax-portal --set-default
```

API key:

```bash
xclaw setup --wizard --auth-choice minimax-global-api
```

## Notes

- MiniMax OAuth uses a user-code login flow.
- OAuth currently targets the Coding Plan path.
