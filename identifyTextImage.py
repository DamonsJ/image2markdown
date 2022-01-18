import layoutparser as lp
import cv2

def union(a,b):
  x = min(a[0], b[0])
  y = min(a[1], b[1])
  w = max(a[0]+a[2], b[0]+b[2]) - x
  h = max(a[1]+a[3], b[1]+b[3]) - y
  return (x, y, w, h)

def intersection(a,b):
  x = max(a[0], b[0])
  y = max(a[1], b[1])
  w = min(a[0]+a[2], b[0]+b[2]) - x
  h = min(a[1]+a[3], b[1]+b[3]) - y
  if w<0 or h<0: return (False, 0,0,0,0)
  return (True, x, y, w, h)


def parseImageFromDocument(image_rgb):
    model = lp.Detectron2LayoutModel('lp://PubLayNet/mask_rcnn_X_101_32x8d_FPN_3x/config', 
                                 extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.8],
                                 label_map={0: "Text", 1: "Title", 2: "List", 3:"Table", 4:"Figure"})

    layout = model.detect(image_rgb)

    rect = []
    figure_blocks = lp.Layout([b for b in layout if b.type=='Figure'])
    for block in figure_blocks:
        coords = block.coordinates
        r = [int(coords[0]), int(coords[1]), int(coords[2]), int(coords[3])]
        r.append(r[0] + r[2] // 2)
        r.append(r[1] + r[3] // 2)
        rect.append(r)
    
    return rect

def recgonizeTextArea(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blur = cv2.GaussianBlur(gray, (7,7), 0)
    thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

    # Create rectangular structuring element and dilate
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
    dilate = cv2.dilate(thresh, kernel, iterations=4)

    # Find contours and draw rectangle
    cnts = cv2.findContours(dilate, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]

    rects = []
    for c in cnts:
        x,y,w,h = cv2.boundingRect(c)
        rects.append([x,y,w,h, x + w //2, y + h //2])

    rects_sorted = sorted(rects, key=lambda r: r[5])

    for index in range(len(rects_sorted)):
        x,y,w,h,cx,cy = rects_sorted[index]
        if index > 0:
            pre = rects_sorted[index-1]
            (inter, a, b, c, d) = intersection((x,y,w,h),(pre[0],pre[1],pre[2],pre[3]))
            if inter:
                res = union((x,y,w,h),(pre[0],pre[1],pre[2],pre[3]))
                rects_sorted[index][0] = res[0]
                rects_sorted[index][1] = res[1]
                rects_sorted[index][2] = res[2]
                rects_sorted[index][3] = res[3]
                rects_sorted[index][4] = res[0] + res[2] // 2
                rects_sorted[index][5] = res[1] + res[3] // 2

                rects_sorted[index-1][0] = 0
                rects_sorted[index-1][1] = 0
                rects_sorted[index-1][2] = 0
                rects_sorted[index-1][3] = 0
                rects_sorted[index-1][4] = 0
                rects_sorted[index-1][5] = 0


        if index < (len(rects_sorted) - 1):
            post = rects_sorted[index+1]
            (inter, a, b, c, d) = intersection((x,y,w,h),(post[0],post[1],post[2],post[3]))
            if inter:
                res = union((x,y,w,h),(post[0],post[1],post[2],post[3]))
                rects_sorted[index][0] = res[0]
                rects_sorted[index][1] = res[1]
                rects_sorted[index][2] = res[2]
                rects_sorted[index][3] = res[3]
                rects_sorted[index][4] = res[0] + res[2] // 2
                rects_sorted[index][5] = res[1] + res[3] // 2

                rects_sorted[index+1][0] = 0
                rects_sorted[index+1][1] = 0
                rects_sorted[index+1][2] = 0
                rects_sorted[index+1][3] = 0
                rects_sorted[index+1][4] = 0
                rects_sorted[index+1][5] = 0
        
    all_rects = [ r for r in rects_sorted if r[4] > 0 and r[5] > 0]
    return all_rects

def markTextAndImage(image_rect, all_rects):
    largest_area = [0] * len(image_rect)
    index_l = [-1] * len(image_rect)

    for index, r in enumerate(all_rects):
        r.append(False)
        for index_image, im_rect in enumerate(image_rect):
            (inter, a, b, c, d) = intersection(r,im_rect)
            if inter and largest_area[index_image] < c*d:
                largest_area[index_image] = c*d
                index_l[index_image] = index
    
    for indexdd in index_l:
        if indexdd >= 0:
            all_rects[indexdd][-1] = True

    for index in range(1, len(all_rects)):
        rect = all_rects[index]
        if not rect[-1] and not all_rects[index - 1][-1]:
            res = union(rect,all_rects[index - 1])
            all_rects[index][0] = res[0]
            all_rects[index][1] = res[1]
            all_rects[index][2] = res[2]
            all_rects[index][3] = res[3]
            all_rects[index][4] = res[0] + res[2] // 2
            all_rects[index][5] = res[1] + res[3] // 2

            all_rects[index-1][0] = 0
            all_rects[index-1][1] = 0
            all_rects[index-1][2] = 0
            all_rects[index-1][3] = 0
            all_rects[index-1][4] = 0
            all_rects[index-1][5] = 0
        else:
            continue

    result = [ r for r in all_rects if r[4] > 0 and r[5] > 0]

    return result


if __name__ == '__main__':
    image = cv2.imread("2.png")
    image = image[..., ::-1]
    draw_image = image.copy()
    image_rect = parseImageFromDocument(image)
    all_rects = recgonizeTextArea(image)
    result = markTextAndImage(image_rect, all_rects)
    for r in result:
        x,y,w,h,cx,cy,isImage = r
        if isImage:
            cv2.rectangle(draw_image, (x, y), (x + w, y + h), (36,255,12), 2)
        else:
            cv2.rectangle(draw_image, (x, y), (x + w, y + h), (122, 96, 216), 2)
    
    cv2.imshow('image', draw_image)
    cv2.waitKey()
