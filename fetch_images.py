import urllib.request, re

url = 'https://aimerbschool.com/ugbip/'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    
    # Extract src="url"
    images = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    # Extract url('url')
    bg_images = re.findall(r'url\([\'"]?([^\'"\)]+)[\'"]?\)', html)
    
    print('IMG TAGS:')
    for img in set(images):
        if img.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            print(img)
            
    print('\nBG IMAGES:')
    for img in set(bg_images):
        if img.endswith(('.png', '.jpg', '.jpeg', '.webp')):
            print(img)
            
except Exception as e:
    print('Error:', e)
