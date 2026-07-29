import os

def fix_mojibake(text):
    try:
        # Encode as windows-1252, then decode as utf-8
        return text.encode('windows-1252').decode('utf-8')
    except Exception as e:
        print(f"Error fixing text: {e}")
        return text

# Test
print(fix_mojibake('TillEase Ã¢€” Hybrid POS Software'))

