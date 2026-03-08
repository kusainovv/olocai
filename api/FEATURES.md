i like these ideas

```
When calling BrowserApiTool, use only this JSON format:
{"type":"title","url":"https://example.com"}

Allowed types:
- goto
- title
- click
- type
- extractText
- screenshot

Never use field "command".
Never use type "url" or "open".
Always use field "type".
Always include full url with https://
```