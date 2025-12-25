from pathlib import Path
path = Path('src/pages/Subscriptions.tsx')
text = path.read_text()
marker = 'export default SubscriptionsPage;'
idx = text.find(marker)
if idx == -1:
    raise SystemExit('marker not found')
cut = idx + len(marker)
text = text[:cut].rstrip() + '\n'
path.write_text(text, encoding='utf-8')
