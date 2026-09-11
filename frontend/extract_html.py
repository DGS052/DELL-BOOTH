import json

transcript_path = '/Users/swayam/.gemini/antigravity-ide/brain/68cb6103-8538-4f22-b431-b835e5914e88/.system_generated/logs/transcript_full.jsonl'

user_msgs = []
with open(transcript_path, 'r') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'USER_INPUT':
            user_msgs.append(data.get('content', ''))

msg = user_msgs[-1]
if isinstance(msg, list):
    msg = " ".join([m.get("text", "") for m in msg if "text" in m])

print("Length of last msg:", len(msg))
with open('/Users/swayam/Desktop/gitpull/dell/frontend/last_msg.txt', 'w') as f:
    f.write(msg)
