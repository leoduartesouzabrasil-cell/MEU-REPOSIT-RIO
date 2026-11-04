import sys
from rembg import remove, new_session
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
if len(sys.argv) > 4:
    w, h = im.size; x0, y0, x1, y1 = map(float, sys.argv[4].split(','))
    im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
out = remove(im, session=new_session(sys.argv[3]))
out.save(sys.argv[2]); print(out.size)
