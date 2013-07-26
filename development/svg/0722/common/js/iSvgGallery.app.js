/********************************************\
    iSvg Gallery
    part: app
\********************************************/
iSvgGallery.app = function (photos) {
    /**************************************************************************************\
    相册对应的顶层容器组(g)的ID: albumIdPrefix + nextAlbumId
    图片对应的顶层容器组(g)的ID: imageIdPrefix + nextImageId
    图片对应的图片元素(image): imageIdPrefix + nextImageId + "-img"
    图片对应的图片元素(image)的边框(rect): imageIdPrefix + nextImageId + "-border"
    图片对应的图片元素(image)的操作热区覆盖层(g): imageIdPrefix + nextImageId + "-overlay"
    图片对应的图片元素(image)的操作热区(rect): imageIdPrefix + nextImageId + "-tl/tr/bl/br/c"
    \**************************************************************************************/
    // 数据
    var features = photos.features, 
        albums = photos.albums;

    // 全局变量
    var SVG = "http://www.w3.org/2000/svg", // SVG命名空间
        XLINK = "http://www.w3.org/1999/xlink", // 图片链接
        bodyElId = "body"; // html body元素ID
        galleryElId = "canvas"; // 画廊根元素ID
        albumIdPrefix = "album", // 相册顶层容器组(g)ID前缀
        coverIdPrefix = "cover", // 图片顶层容器组(g)ID前缀
        imageIdPrefix = "image", // 图片顶层容器组(g)ID前缀
        listStyleGrid = "grid", // 相册排列风格: 方格
        listStyleFree = "free", // 相册排列风格: 散乱
        opacityMaximum = 1.0, // 透明度: 不透明
        opacityMiddle = 0.5, // 透明度: 半透明
        opacityMinimum = 0.0, // 透明度: 完全透明，不可见

        nextAlbumId = 0, // 相册唯一ID
        nextImageId = 0, // 图片唯一ID
        relationAI = {}, // 图片相册的关联关系，属性名"albumIdPrefix/coverIdPrefix"+ID，双相关联
        imagesOnGallery = [], // 当前在画廊上展示的图片对应的顶层容器组(g)的ID数组 {id: imageIdPrefix+ID, uri: image_url, position: grid_position}
        topImageOnGallery = {}, // 当前在画廊上置前展示的图片 {id: imageIdPrefix+ID, transform: currentTransform...}
        albumsOnGallery = [], // 当前在画廊上展示的相册对应的顶层容器组(g)的ID数组 {id: albumIdPrefix+ID, position: grid_position}
        topAlbumsOnGallery = {}, // 当前在画廊上置前打开的相册 {id: albumIdPrefix+ID, transform: currentTransform...}
        globalCache = {}, // 程序缓存区，放临时变量
        globalCache.tooltip = {}, // 程序缓存区变量，放tooltip定时函数等(变量名：提示框元素ID + "-function" = {src:提示框对应的元素ID, id:提示框元素ID, func:提示框定时函数})
        globalCache.opacity = {}, // 程序缓存区变量，放元素透明度定时函数等(变量名：透明度变化元素ID + "-function"={id:透明度变化元素ID, func:透明度变化定时函数})
        globalCache.debug = "", // 程序缓存区，放调试信息

        currentTransform = null, // 变形参数
        galleryMinWidth = 1005, // 画廊最小宽度
        galleryMinHeight = 618; // 画廊最小高度
        galleryViewWidth = document.documentElement.clientWidth<galleryMinWidth ? galleryMinWidth : document.documentElement.clientWidth, // 画廊当前可视宽度
        galleryViewHeight = document.documentElement.clientHeight<galleryMinHeight ? galleryMinHeight : document.documentElement.clientHeight; // 画廊当前可视高度
        galleryWidth = galleryViewWidth, // 画廊实际宽度
        galleryHeight = galleryViewHeight, // 画廊实际高度
        imgMinWidth = 300, // 画廊接受显示的最小的图片宽度
        imgMinHeight = 200, // 画廊接受显示的最小的图片高度
        imgZoomMinWidth = 250*galleryMinWidth/galleryWidth, // 图片缩放最小宽度
        imgZoomMinHeight = 260*galleryMinHeight/galleryHeight, // 图片缩放最小高度
        imgInitWRange = [imgZoomMinWidth, 350*galleryMinWidth/galleryWidth], // 图片初始化到画廊上时的宽度区间(galleryViewWidth/galleryMinWidth > 1时，最小值和最大值乘以该倍数)
        imgInitHRange = [imgZoomMinHeight, 300*galleryMinHeight/galleryHeight], // 图片初始化到画廊上时的高度区间(galleryViewHeight/galleryMinHeight > 1时，最小值和最大值乘以该倍数)
        albumThumbBaseWidth = 1000, // 相册封面基准尺寸
        albumThumbBaseHeight = 700,
        albumThumbWidth = 200, // 相册缩略图尺寸
        albumThumbHeight = 140,
        albumThumbDiagonal = Math.sqrt(Math.pow(albumThumbWidth, 2) + Math.pow(albumThumbHeight, 2)), // 相册缩略图对角线

        imageListStyle = listStyleFree, // 图片排列风格
        imageBorderRadius = "20", // 图片圆角处理
        imageBorderClass = "imageBorder", // 图片边框CSS类
        imageBorderStrokeWidth = "25", // 图片边框笔触宽度
        imageBorderStrokeWidthMin = "16", // 图片边框笔触最小宽度
        imageDefaultOpacity = 1.0, // 图片默认透明度
        imageHoverOpacity = 0.7, // 图片悬停透明度
        imageOverlayClass = "imageOverlay", // 图片遮盖层CSS类
        hotSpotClass = "imageHotSpot", // 操作热区CSS类
        hotSpotFillColor = "rgba(0, 200, 200, 0.3)", // 操作热区填充颜色、透明度
        hotSpotStrokeColor = "rgba(100, 100, 100, 0.5)", // 操作热区填充颜色、透明度
        hotSpotSide = 200, // 操作热区边长
        hotSpotSideMinimum = 20, // 操作热区最小边长
        hotSpotRadius = 30, // 操作热区圆角
        topImageResizable = false, // 置前显示的原图是否可以调节大小
        topImageExclusive = true, // 置前显示的原图是否显示背景遮盖层，以屏蔽其他操作
        topImageBgOverlayId = "top-img-background-overlay", // 置前显示的原图的背景遮盖层ID

        albumListStyle = listStyleGrid, // 相册排列风格
        albumOpenedOpacity = 0.5, // 相册打开时的透明度(动画效果)
        albumClosedOpacity = 0.3, // 相册打开时的透明度(动画效果)
        coverBorderRadius = "10", // 封面圆角处理
        coverBorderClass = "coverBorder", // 封面图片边框CSS类

        contextMenuId = "ctxMenu", // 右键菜单的顶层容器组(g)的ID
        ctxMenuItemClass = "ctxMenuItem", // 右键菜单项目CSS样式类
        ctxMenuItemHoverClass = "ctxMenuItemHover", // 右键菜单项目悬停CSS样式类
        ctxMenuItemTextClass = "ctxMenuItemText", // 右键菜单项目文本CSS样式类
        ctxMenuItemTextHoverClass = "ctxMenuItemTextHover", // 右键菜单项目文本悬停CSS样式类
        ctxDividingLineClass = "ctxDividingLine", // 右键菜单项目分隔条CSS样式类

        tooltipBackgroundClass = "tooltipBackground", // 提示框背景CSS样式类
        tooltipTextClass = "tooltipText" // 提示框文本CSS样式类
    ;

    ///
    // 入口函数
    // 画面加载完毕时调用
    ///
    function load() {
        // 定义滤镜等效果
        // createFilters();

        // 创建相册列表
        listAlbums(albums);

        // 显示特别图片
        listImages(features);

        // 添加鼠标移动时和鼠标按键弹起时事件处理
        // 添加对象: svg[ID=canvas], rect[ID=background-rect]
        document.getElementById(galleryElId).addEventListener("mousemove", onMouseMove, false);
//DEBUG
//document.getElementById(galleryElId).addEventListener("dblclick", function(ev){ if(ev.target.id.indexOf("cover")==0 || ev.target.id.indexOf("image")==0 || ev.target.id.indexOf("top-img")==0){return;}  alert(globalCache.debug); globalCache.debug = ""; }, false);
        document.getElementById(galleryElId).addEventListener("mouseup", onMouseUp, false);
        document.getElementById("background-rect").addEventListener("mousemove", onMouseMove, false);
        document.getElementById("background-rect").addEventListener("mouseup", onMouseUp, false);

        // 添加右键单击时事件处理
        // 添加对象: svg[ID=canvas]
        document.getElementById(galleryElId).addEventListener(
                "contextmenu", 
                function(evt){ 
                        // 构建右键菜单
                        buildContextMenu(evt); 

                        evt.preventDefault(); 
                }, 
                false
        );

        // 添加左键单击时事件处理
        // 添加对象: svg[ID=canvas]
        document.getElementById(galleryElId).addEventListener(
                "click", 
                function(evt){ 
                        var el = document.getElementById(contextMenuId);

                        // 右键菜单存在，删除
                        if(el) {
                            el.parentNode.removeChild(el);
                        }

                        // evt.preventDefault(); 
                 }, 
                 true
        );

        // 添加窗口大小变化时事件处理
        window.addEventListener(
                "resize", 
                function(evt){ 
                        setGalleryView(document.documentElement.clientWidth, document.documentElement.clientHeight); 
                        evt.preventDefault();
                }, 
                false
        );
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // REGION 业务调用
    //////////////////////////////////////////////////////////////////////////////////////////
    ///
    // 展示相册列表
    // albums: 相册信息数组或者对象
    ///
    function listAlbums(albums) {
        var seatsPerRow = Math.floor(galleryViewWidth/albumThumbDiagonal); // 当前画廊一行可放置相册数目
        var seatsPerColumn = Math.floor(galleryViewHeight/albumThumbWidth); // 当前画廊一列可放置相册数目
        var posInfo; // 相册位移量、相册位置序列 {translate: [x, y], position: [x, y](from [0, 0]), overflow: true/false}

        // 相册数目判断
        if(!(albums instanceof Array)) {
            // albumsOnGallery.length: 当前显示在画廊的相册数目
            posInfo = calcElementPosition(albumListStyle, seatsPerRow, seatsPerColumn, albumThumbDiagonal, albumThumbWidth, albumsOnGallery.length);

            // 当排列方式为方格式，并且排列位置超出显示范围
            if(albumListStyle == listStyleGrid && posInfo.overflow) {
                // 调整画廊实际尺寸
                fixGallerySize(1, 2);
                // 重新计算位置
                posInfo = calcElementPosition(albumListStyle, seatsPerRow, seatsPerColumn, albumThumbDiagonal, albumThumbWidth, albumsOnGallery.length);
            }

            displayAlbum(
                0, 
                albums, 
                { 
                    translate: posInfo.translate,  // 相册位移
                    position: posInfo.position // 相册位置序列
                }
            );
        } else {
            // 处理相册图片
            for (var k = 0; k < albums.length; k++) {
                // albumsOnGallery.length: 当前显示在画廊的相册数目
                posInfo = calcElementPosition(albumListStyle, seatsPerRow, seatsPerColumn, albumThumbDiagonal, albumThumbWidth, albumsOnGallery.length);

                // 当排列方式为方格式，并且排列位置超出显示范围
                if(albumListStyle == listStyleGrid && posInfo.overflow) {
                    // 调整画廊实际尺寸
                    fixGallerySize(1, 2);
                    // 重新计算位置
                    posInfo = calcElementPosition(albumListStyle, seatsPerRow, seatsPerColumn, albumThumbDiagonal, albumThumbWidth, albumsOnGallery.length);
                }

                displayAlbum(
                    k, 
                    albums[k], 
                    { 
                        translate: posInfo.translate,  // 相册位移
                        position: posInfo.position // 相册位置序列
                    }
                );
            }
        }
    }

    ///
    // 展示相册
    // k: 相册序号，生成位移值等用的随机数
    // album: 相册
    // param: 相册配置
    ///
    function displayAlbum(k, album, param) {
        // 不存在的相册ID，异常情况
        if(!album.id && album.id != 0) return;

        // 叠加显示图片用作封面
        var imgInfos = []; // 图片信息

        // 从相册的图片中取三张显示成封面
        for (var i = 0; i < album.images.length; i++) {
            if(i>2) break;

            imgInfos.push(album.images[i]);
        }

        // 如果相册存在封面，同样取出
        if(album.cover) imgInfos.push(album.cover);
        // 相册唯一ID
        var almId = nextAlbumId++;
        // 初始图片唯一ID
        // 加载图片时，为图片分配唯一ID，此处为批量添加图片图片唯一ID连续，
        var imgSID = nextImageId;

        // 显示相册
        listImages(imgInfos, param);

        // 最后图片唯一ID
        var imgEID = nextImageId - 1; // 为图片分配唯一ID后有 +1 操作

        // 设定相册、图片关联关系
        var almIdStr = albumIdPrefix + almId; // 相册元素ID
        relationAI[almIdStr] = {};
        relationAI[almIdStr].id = album.id;
        relationAI[almIdStr].name = album.name;
        relationAI[almIdStr].cover = album.cover;
        relationAI[almIdStr].images = [];
        for(var j=imgSID; j<=imgEID; j++) {
            relationAI[almIdStr].images.push(coverIdPrefix + j);
            relationAI[coverIdPrefix + j] = {};
            relationAI[coverIdPrefix + j].parent = almIdStr;
        }

        // 创建相册容器组(g)
        var g = document.createElementNS(SVG, "g");
        g.setAttribute("id", almIdStr);
        g.vTranslate = [0, 0]; // 元素中心点坐标 位移 albumThumbDiagonal/2*(2*k+1)
        g.vScale = 1; // 缩放比例
        g.vRotate = 0; // 旋转
        // 鼠标按下时: 设置变形参数，变换透明度
        g.addEventListener(
                "mousedown", 
                function(evt) { 
                        startAlbumTransform(evt, "c", "move"); 
                        evt.preventDefault(); 
                }, 
                false
        ); 
        document.getElementById(galleryElId).appendChild(g); // 把图片对应的顶层容器组(g)添加到SVG标签中

        // 把相册添加到画廊相册数组
        albumsOnGallery.push({id: almIdStr, position: param.position});
    }

    ///
    // 展示图片列表
    // images: 图片列表（数组，或单一图片）
    // param: 不为空时，图片为封面图片列表
    ///
    function listImages(images, param) {
        // 图片数目判断
        if(!(images instanceof Array)) {
            displayImage(images, param);
        } else {
            // 在后台加载图片，当图片加载完毕后（一般由浏览器缓存），执行循环里的处理
            for (var k = 0; k < images.length; k++) {
                displayImage(images[k], param);
            }
        }
    }

    ///
    // 展示图片
    // image: 图片url
    // param: 不为空时，图片为封面图片，包含相册的位置、缩放比例等信息
    ///
    function displayImage(image, param) {
        var img = new Image();

        // 图片唯一ID
        var imgId = nextImageId++;
        // 为使函数取得正确的变量，使用匿名函数
        img.onload = function(url, imgId) { return function() {
                // 图片的长度或者宽度小于50px的图片不显示
                if(this.width < imgMinWidth || this.height < imgMinHeight) {
                    return;
                }

                // param被设定，是封面图片
                if(param) {
                    var g = addCover(this, imgId, url, opacityMaximum, param); // 取得封面图片的顶层容器组(g)
                } else {
                    var g = addImage(this, imgId, url, opacityMaximum); // 取得图片的顶层容器组(g)
                }

                // 图片添加失败，异常返回
                if(!g) {
                    return;
                } else if(topImageOnGallery.id) { // 如果当前有图片置前，保持其置前状态
                    if(topImageExclusive) { // 有图片遮盖层，置前先
                        bringToFront(topImageBgOverlayId);
                    }

                    // 置前图片
                    bringToFront(topImageOnGallery.id);
                }

                // 对图片的顶层容器组(g)进行样式设定和随机变形
                // 封面图片，使用计算好的相册统一位移
                if(param) {
                    g.vTranslate = param.translate; // 元素中心点坐标 位移
                    g.vScale = albumThumbWidth/albumThumbBaseWidth > albumThumbHeight/albumThumbBaseHeight ? albumThumbHeight/albumThumbBaseHeight : albumThumbWidth/albumThumbBaseWidth; // 缩放比例额，控制封面不要过大
                } else {
                    // 相册位移量、相册位置序列 {translate: [x, y], position: [x, y](from [0, 0]), overflow: true/false}
                    var posInfo = calcElementPosition(imageListStyle, 4, 3, galleryMinWidth/4, galleryMinHeight/3, imagesOnGallery.length, galleryViewWidth, galleryViewHeight);
                    // 当排列方式为方格式，并且排列位置超出显示范围
                    if(imageListStyle == listStyleGrid && posInfo.overflow) {
                        // 调整画廊实际尺寸
                        fixGallerySize(1, 2);
                        // 重新计算位置
                        posInfo = calcElementPosition(imageListStyle, 4, 3, galleryMinWidth/4, galleryMinHeight/3, imagesOnGallery.length, galleryViewWidth, galleryViewHeight);
                    }
                    g.vTranslate = posInfo.translate; // 元素中心点坐标 位移

                    var sideRange = getImgInitSideRange(this.width, this.height); // 图片初始化边长范围
                    if(this.height > this.width) {
                        g.vScale = sideRange.height[0]/this.height + Math.random() * ((sideRange.height[1] - sideRange.height[0])/this.height); // 缩放比例在设定范围内
                    } else {
                        g.vScale = sideRange.width[0]/this.width + Math.random() * ((sideRange.width[1] - sideRange.width[0])/this.width); // 缩放比例在设定范围内
                    }

                    // 把图片添加到画廊图片数组
                    imagesOnGallery.push({id: (imageIdPrefix + imgId), uri:this.src, position: posInfo.position});
                }
                g.style.opacity = opacityMaximum; // 透明度
                g.vRotate = (Math.random() * 40) - 20; // 旋转

                // 检证，保证图片至少有一半左右显示在画廊上
                g.vTranslate[0] = g.vTranslate[0] > galleryViewWidth ? (galleryViewWidth - albumThumbWidth/4) : g.vTranslate[0];
                g.vTranslate[1] = g.vTranslate[1] > galleryViewHeight ? (galleryViewHeight - albumThumbHeight/4) : g.vTranslate[1];

                // 执行变形
                setupTransform(g.id);

                // 降低透明度
                rampOpacity(g, imageDefaultOpacity);
            }
        } (image, imgId);

        // 图片属性设置
        img.src = image;
    }

    ///
    // 根据提供的图片地址，
    // 创建对应的图片元素(image)、顶层容器组(g)和可点击的操作热区(rect)
    // source: 封面图片的JavaScript Image对象
    // imgId: 图片唯一ID
    // url: 图片url
    // initOpacity: 图片的透明度 (0, 1)
    ///
    function addImage(source, imgId, url, initOpacity) {
        // 初始化图片对应的顶层容器组(g)的ID
        var s = imageIdPrefix + imgId;

        // 创建顶层容器组(g)
        var g = document.createElementNS(SVG, "g");
        g.setAttribute("id", s);
        g.addEventListener("mouseover", onEnterImage, false); // 鼠标移到图片上时
        g.addEventListener("mouseout", onExitImage, false); // 鼠标从图片移开时
        // 鼠标按下时: 设置变形参数，变换透明度
        g.addEventListener(
                "mousedown", 
                function(evt) { 
                        startTransform(evt, "c", "move"); 
                        evt.preventDefault(); 
                }, 
                false
        ); 

        // 鼠标双击时: 显示原图
        g.addEventListener(
                "dblclick", 
                function(evt) { 
                        showHideSourceImage(s); 
                        evt.preventDefault(); 
                }, 
                false
        ); 

        // 初始化透明度
        if (initOpacity != null) {
            g.style.opacity = initOpacity;
        }

        // 创建对应的图片元素(image)
        var image = document.createElementNS(SVG, "image");
        image.setAttribute("id", s+"-img"); // 图片元素(image)ID
        svgSetXYWH(image, -source.width/2, -source.height/2, source.width, source.height); 
        image.setAttribute("preserveAspectRatio", "xMinYMin slice"); // 设定图片缩放
        image.setAttributeNS(XLINK, "href", url); // 为图片添加链接
        g.appendChild(image); // 把对应的图片元素(image)添加到顶层容器组(g)中

        // 为对应的图片元素(image)添加边框
        var rect = document.createElementNS(SVG, "rect");
        rect.setAttribute("id", s+"-border");
        rect.setAttribute("class", imageBorderClass);
        svgSetXYWH(rect, -source.width/2, -source.height/2, source.width, source.height);
        rect.setAttribute("rx", imageBorderRadius); // 边框X方向圆角
        rect.setAttribute("ry", imageBorderRadius); // 边框Y方向圆角
        var imgBdrStrkW = imageBorderStrokeWidth*source.width/galleryMinWidth; // 触笔宽度
            imgBdrStrkW = imgBdrStrkW<imageBorderStrokeWidthMin ? imageBorderStrokeWidthMin : imgBdrStrkW;
        rect.setAttribute("stroke-width", imgBdrStrkW); // 触笔宽度
        g.appendChild(rect); // 把对应的图片元素(image)的边框添加到顶层容器组(g)中

        // 创建对应的图片元素(image)的操作热区覆盖层(g)
        var g2 = document.createElementNS(SVG, "g");
        g2.setAttribute("id", s+"-overlay"); // 操作热区覆盖层(g)ID
        g2.setAttribute("class", imageOverlayClass); // 操作热区覆盖层(g)的CSS类
        g2.setAttribute("style", "visibility: hidden"); // 默认不显示

        // 创建对应的图片元素(image)的操作热区(rect)
        var side = source.width>source.height ? source.height : source.width; // 长宽度中的最小值
        var rsz = side/5>hotSpotSide ? hotSpotSide : side/5; // 取边长的五分之一做操作热区大小
            rsz= rsz<hotSpotSideMinimum ? hotSpotSideMinimum : rsz; // 最小二十像素

        // 位置: 左上角
        g2.appendChild(
                newClickableRect(
                        s+"-tl", // ID
                        -source.width/2, // X坐标
                        -source.height/2, // Y坐标
                        rsz, // 宽度
                        rsz, // 高度
                        hotSpotFillColor, // 填充
                        hotSpotStrokeColor, // 触笔
                        function (evt) { return startTransform(evt, 'tl', 'rotate'); }, // 鼠标按下时: 设置变形参数，变换透明度
                        hotSpotClass // CSS样式类
                )
        );
        // 位置: 右上角
        g2.appendChild(
                newClickableRect(
                        s+"-tr", // ID
                        source.width/2-rsz, // X坐标
                        -source.height/2, // Y坐标
                        rsz, // 宽度
                        rsz, // 高度
                        hotSpotFillColor, // 填充
                        hotSpotStrokeColor, // 触笔
                        function (evt) { return startTransform(evt, 'tr', 'rotate'); }, // 鼠标按下时: 设置变形参数，变换透明度
                        hotSpotClass // CSS样式类
                )
        );
        // 位置: 右下角
        g2.appendChild(
                newClickableRect(
                        s+"-br", // ID
                        source.width/2-rsz, // X坐标
                        source.height/2-rsz, // Y坐标
                        rsz, // 宽度
                        rsz, // 高度
                        hotSpotFillColor, // 填充
                        hotSpotStrokeColor, // 触笔
                        function (evt) { return startTransform(evt, 'br', 'rotate'); }, // 鼠标按下时: 设置变形参数，变换透明度
                        hotSpotClass // CSS样式类
                )
        );
        // 位置: 左下角
        g2.appendChild(
                newClickableRect(
                        s+"-bl", // ID
                        -source.width/2, // X坐标
                        source.height/2-rsz, // Y坐标
                        rsz, // 宽度
                        rsz, // 高度
                        hotSpotFillColor, // 填充
                        hotSpotStrokeColor, // 触笔
                        function (evt) { return startTransform(evt, 'bl', 'rotate'); }, // 鼠标按下时: 设置变形参数，变换透明度
                        hotSpotClass // CSS样式类
                )
        );
        /*
        // 位置: 中央
        g2.appendChild(
                newClickableRect(
                        s+"-c", // ID
                        -rsz/2, // X坐标
                        -rsz/2, // Y坐标
                        rsz, // 宽度
                        rsz, // 高度
                        hotSpotFillColor, // 填充
                        hotSpotStrokeColor, // 触笔
                        function (evt) { return startTransform(evt, 'c', 'scale'); }, // 鼠标按下时: 设置变形参数，变换透明度
                        hotSpotClass // CSS样式类
                )
        );
        */
        g.appendChild(g2); // 把对应的图片元素(image)的操作热区覆盖层添加到顶层容器组(g)中

        document.getElementById(galleryElId).appendChild(g); // 把图片对应的顶层容器组(g)添加到SVG标签中

        return g; // 返回图片对应的顶层容器组(g)
    }

    ///
    // 根据提供的封面地址，
    // 创建对应的图片元素(image)、顶层容器组(g)和可点击的操作热区(rect)
    // source: 封面图片的JavaScript Image对象
    // imgId: 图片唯一ID
    // url: 图片url
    // initOpacity: 图片的透明度 (0, 1)
    // param: 封面图片参数，包含封面样式等信息，不添加图片操作热区
    ///
    function addCover(source, imgId, url, initOpacity, param) {
        var imgw = albumThumbBaseWidth; // 图片默认宽度
        var imgh = albumThumbBaseHeight; // 图片默认高度

        // 初始化图片对应的顶层容器组(g)的ID
        var s = coverIdPrefix + imgId;

        // 创建顶层容器组(g)
        var g = document.createElementNS(SVG, "g");
        g.setAttribute("id", s);
        // 鼠标按下时: 设置变形参数，变换透明度
        g.addEventListener(
                "mousedown", 
                function(evt) { 
                        startAlbumTransform(evt, "c", "move"); 
                        evt.preventDefault(); 
                }, 
                false
        );

        // 鼠标移到图片上时， 显示相册名称
        g.addEventListener(
                "mouseover", 
                function(evt) { 
                        onEnterCover(evt);
                        evt.preventDefault(); 
                }, 
                false
        );

        // 鼠标双击时: 展开相册以浏览
        g.addEventListener(
                "dblclick", 
                function(evt) { 
                        clearGallery(); // 清空画廊图片
                        postAlbumOnGellery(s); // 显示该相册图片

                        evt.preventDefault(); 
                }, 
                false
        ); 

        // 初始化透明度
        if (initOpacity != null) {
            g.style.opacity = initOpacity;
        }

        // 创建对应的图片元素(image)
        var image = document.createElementNS(SVG, "image");
        image.setAttribute("id", s+"-img"); // 图片元素(image)ID
        svgSetXYWH(image, -imgw/2, -imgh/2, imgw, imgh);
        if(browser("webkit")) { // chrome/safari 图片显示模式
            image.setAttribute("preserveAspectRatio", "xMinYMin slice"); // 设定图片缩放 for webkit
        } else { // IE9/firefox...图片显示模式
            image.setAttribute("preserveAspectRatio", "xMidYMid slice"); // 设定图片缩放 for FF,IE9
        }
        image.setAttributeNS(XLINK, "href", url); // 为图片添加链接
        g.appendChild(image); // 把对应的图片元素(image)添加到顶层容器组(g)中

        // 为对应的图片元素(image)添加边框
        var rect = document.createElementNS(SVG, "rect");
        rect.setAttribute("id", s+"-border");
        rect.setAttribute("class", coverBorderClass); // 图片元素CSS样式类
        svgSetXYWH(rect, -imgw/2, -imgh/2, imgw, imgh);
        rect.setAttribute("rx", coverBorderRadius); // 边框X方向圆角
        rect.setAttribute("ry", coverBorderRadius); // 边框Y方向圆角
        g.appendChild(rect); // 把对应的图片元素(image)的边框添加到顶层容器组(g)中

        // 封面图片，不添加图片操作热区，把图片添加到相册
        if(document.getElementById(parentAlbumName(s))) {
            document.getElementById(parentAlbumName(s)).appendChild(g); // 把图片对应的顶层容器组(g)添加到SVG标签中
        }

        return g; // 返回图片对应的顶层容器组(g)
    }

    ///
    // 图片变形参数设定处理函数
    // ev: Event 事件
    // corner: 举行的边角(无用)
    // what: 变形类型[move(移动) , rotate(旋转缩放) ...]
    ///
    function startTransform(ev, corner, what) {
        // 当其他变形在执行的过程中，忽略本次操作
        if (currentTransform != null) {
            return;
        }

        // 取得目标对象对应的顶层容器组(g)的ID，取得不到时，异常返回
        var e = baseName(ev);
        if (!e) {
            return;
        }

        // 把目标对象放置到最前面
        bringToFront(e);
        // 取得目标对象对应的顶层容器组(g)
        var g = document.getElementById(e);
        // 取得目标对象对应的图片及最小比例
        var img = document.getElementById(e+"-img");
        // 图片缩放最小比例
        var sx = img.width.baseVal.value > img.height.baseVal.value ? imgZoomMinWidth/img.width.baseVal.value : imgZoomMinHeight/img.height.baseVal.value;

        currentTransform = { 
            what: what, // 变形类型
            el: e, // 触发元素对应的顶层容器组(g)的ID
            corner: corner, // 矩形的角
            g: g, // 触发元素对应的顶层容器组(g)元素
            s: g.vScale, // 比例
            sx: sx, // 最小比例
            r: g.vRotate, // 旋转角度
            t: g.vTranslate, // 元素中心点坐标
            x: ev.clientX, // 事件触发点(原坐标)的X坐标
            y: ev.clientY // 事件触发点(原坐标)的Y坐标
        };

        // 提高透明度
        rampOpacity(currentTransform.g, imageHoverOpacity);
    }

    ///
    // 相册变形参数设定处理函数
    // ev: Event 事件
    // corner: 举行的边角(无用)
    // what: 变形类型[move(移动) , rotate(旋转缩放) ...]
    ///
    function startAlbumTransform(ev, corner, what) {
        // 当其他变形在执行的过程中，忽略本次操作
        if (currentTransform != null) {
            return;
        }

        // 取得目标对象对应的顶层容器组(g)的ID，取得不到时，异常返回
        var e = baseName(ev);
        if (!e) {
            return;
        }

        // 如果目标对象不是相册容器组(g)，是相册中的图片对象
        if(e.indexOf(albumIdPrefix) < 0) {
            e = parentAlbumName(e);
        }

        // 取得目标对象对应的相册容器组(g)对象
        var g = document.getElementById(e);

        // 相册容器组(g)对象取得不到，返回
        if(!g) return;

        currentTransform = { 
            what: what, // 变形类型
            el: e, // 触发元素对应的顶层容器组(g)的ID
            corner: corner, // 矩形的角
            g: g, // 触发元素对应的顶层容器组(g)元素
            s: g.vScale, // 比例
            sx: 0, // 最小比例
            r: g.vRotate, // 旋转角度
            t: g.vTranslate, // 元素中心点坐标
            x: ev.clientX, // 事件触发点(原坐标)的X坐标
            y: ev.clientY // 事件触发点(原坐标)的Y坐标
        };

        // 提高透明度
        rampOpacity(currentTransform.g, imageHoverOpacity);
    }

    ///
    // 清除当前画廊上展示的图片
    // animate: 使用渐变等效果 true：使用 others: 不使用
    ///
    function clearGallery(animate) {
        // 如果存在置前图片，取消置前，
        // 并把全局记录的当前置前显示的图片信息清除
        if(topImageOnGallery.id) {
            // 把当前置前图片取消置前
            showHideSourceImage(topImageOnGallery.id);

            // 初始化置前图片信息
            topImageOnGallery = {};
        }

        // 把全局记录的当前在画廊上展示的图片信息清除
        if(imagesOnGallery instanceof Array) {
            while(imagesOnGallery.length > 0) {
                var img = document.getElementById(imagesOnGallery.shift().id);

                if(img) {
                    // 从画廊上移除
                    document.getElementById(galleryElId).removeChild(img);
                }
            }
        }

        // 当前有相册被打开，删除其动画效果
        if(topAlbumsOnGallery.id) {
            animateAlbum(topAlbumsOnGallery.id, false); 
        }

        // 把全局记录的当前打开的相册信息清除
        topAlbumsOnGallery = {};

        // 显示隐藏的相册
        showHideAlbums(false, animate);
    }

    ///
    // 清除当前画廊上展示的图片
    // imgId: imageIdPrefix + ID
    ///
    function getImageOnGallery(imgId) {
        if(imagesOnGallery instanceof Array) {
            for(var i=0; i<imagesOnGallery.length; i++) {
                if(imagesOnGallery[i].id == imgId) return imagesOnGallery[i];
            }
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // REGION 事件处理
    //////////////////////////////////////////////////////////////////////////////////////////
    ///
    // 鼠标移到图片上时处理函数
    // ev: Event 事件
    ///
    function onEnterImage(ev) {
        // 取得目标对象对应的顶层容器组(g)的ID，取得不到时，异常返回
        var e = baseName(ev);
        if (!e) {
            return;
        }

        // 显示操作热区覆盖层(当前图片置前显示的时候不显示)
        if(topImageOnGallery.id != e || 
                (topImageResizable && topImageOnGallery.id == e)) {
            document.getElementById(e + '-overlay').style.visibility = "visible";
        }

        ev.preventDefault();
    }

    ///
    // 鼠标移到封面图片上时处理函数
    // ev: Event 事件
    ///
    function onEnterCover(ev) {
        // 取得封面图片对应的顶层容器组(g)的ID
        var e = baseName(ev);
        if (!e) return; // 取得不到时，异常返回
        // 取得相册数据对象
        var album = parentAlbum(e);
        if(album && album.name) {
            renderTooltip(ev, album.name, false, 300000);
        }

        ev.preventDefault();
    }

    ///
    // 鼠标从图片移开时处理函数
    // ev: Event 事件
    ///
    function onExitImage(ev) {
        // 取得目标对象对应的顶层容器组(g)的ID，取得不到时，异常返回
        var e = baseName(ev);
        if (!e) {
            return;
        }

        // 隐藏操作热区覆盖层
        document.getElementById(e + '-overlay').style.visibility = "hidden";

        ev.preventDefault();
    }

    ///
    // 鼠标按键弹起时处理函数：降低透明度
    // ev: Event 事件
    ///
    function onMouseUp(ev) {
        // 取得相册对象
        var evs = baseName(ev); // 事件对象顶层容器组(g)ID
        var almObj; // 相册顶层容器组(g)对象
        if(evs.indexOf(albumIdPrefix) == 0) {
            var alms = evs; // 相册顶层容器组(g)ID
            var almObj = document.getElementById(evs);
        } else if(evs.indexOf(coverIdPrefix) == 0) {
            var alms = parentAlbumName(evs);
            var almObj = document.getElementById(alms);
        }

        // 如果是相册封面，并且存在打开的相册，但对象不是当前打开的相册
        if(almObj && topAlbumsOnGallery.id && topAlbumsOnGallery.id != alms) {
            // 提高透明度
            rampOpacity(almObj, albumClosedOpacity, imageHoverOpacity);

            // 清空变形参数
            currentTransform = null;

            ev.preventDefault();

            return;
        } else if(almObj && topAlbumsOnGallery.id && topAlbumsOnGallery.id == alms){
            // 降低透明度
            rampOpacity(almObj, albumOpenedOpacity, imageHoverOpacity);

            // 清空变形参数
            currentTransform = null;

            ev.preventDefault();

            return;
        }

        // 变形参数被设定，降低透明度
        if (currentTransform) {
            // 降低透明度
            rampOpacity(currentTransform.g, imageDefaultOpacity, imageHoverOpacity);
        }

        // 清空变形参数
        currentTransform = null;

        ev.preventDefault();
    }

    ///
    // 鼠标移动时处理函数：降低透明度
    // ev: Event 事件
    ///
    function onMouseMove(ev) {
        // 处理相册封面onMouseOver定时函数处理
        // 程序缓存区有提示框设定
        if(globalCache && globalCache.tooltip) {
            // 删除定时函数和清空在显示的提示框
            for(var f in globalCache.tooltip) {
                // 标鼠指针在封面上快速掠过，不显示提示框，并移除已有的提示框
                if(baseName(ev).indexOf(coverIdPrefix) == -1) {
                    clearTimeout(globalCache.tooltip[f].func); // 删除定时函数

                    var tt = document.getElementById(globalCache.tooltip[f].id); // 提示框元素
                    if(tt) { // 如果封面被移动
                        tt.parentNode.removeChild(tt); // 移除其上的提示框
                    }

                    delete globalCache.tooltip[f]; // 删除程序缓冲区数据
                } else if(currentTransform) {
                    var tt = document.getElementById(globalCache.tooltip[f].id); // 提示框元素
                    if(tt) { // 如果封面被移动
                        tt.parentNode.removeChild(tt); // 移除其上的提示框
                    }
                }
            }
        }

        // currentTransform不是window的属性，或者currentTransform为null，直接返回
        if (currentTransform == null) {
            return;
        }

        var ex = ev.clientX; // 目的坐标的X坐标
        var ey = ev.clientY; // 目的坐标的Y坐标
        var pos = currentTransform.g.vTranslate; // 元素中心点坐标

        // 旋转
        if (currentTransform.what == "rotate") {
            var r2d = 360.0 / (2.0 * Math.PI); // 弧度/角度转换单位制 -> 1弧度=?角度

            // atan2(y,x) : 返回从 x 轴到点 (x,y) 的角度（介于 -PI/2 与 PI/2 弧度之间）
            // 事件触发点(原坐标)与X轴夹角
            // 事件触发点(原坐标) -> [currentTransform.x, currentTransform.y]
            var lastAngle = Math.atan2(currentTransform.y - pos[1], currentTransform.x - pos[0]) * r2d; 
            // 目的坐标与X轴夹角
            // 目的坐标 -> [ex, ey]
            var curAngle = Math.atan2(ey - pos[1], ex - pos[0]) * r2d;

            // 旋转角度
            currentTransform.g.vRotate += (curAngle - lastAngle);

            // sqrt(x) : 返回数的平方根
            // pow(x,y) : 返回 x 的 y 次幂
            // 事件触发点(原坐标)到元素中心点坐标的距离
            var lastLen = Math.sqrt(Math.pow(currentTransform.y - pos[1], 2) + Math.pow(currentTransform.x - pos[0], 2));
            // 目的坐标到元素中心点坐标的距离
            var curLen = Math.sqrt(Math.pow(ey - pos[1], 2) + Math.pow(ex - pos[0], 2));

            // 变形比例
            var calcScale = currentTransform.g.vScale * (curLen / lastLen);
            currentTransform.g.vScale = calcScale > currentTransform.sx ? (calcScale > 1 ? 1 : calcScale) : currentTransform.sx; 

        // 移动
        } else if (currentTransform.what == "move") {
            // XY坐标位移
            var xd = ev.clientX - currentTransform.x;
            var yd = ev.clientY - currentTransform.y;

            // 元素中心点坐标
            currentTransform.g.vTranslate = [ pos[0] + xd, pos[1] + yd ];
        }

        // 变形的坐标
        currentTransform.x = ex;
        currentTransform.y = ey;

        // 执行变形
        setupTransform(currentTransform.el);

        ev.preventDefault();
    }

    ///
    // 把相册显示到画廊上
    // id: 相册唯一ID/图片对应的顶层容器组(g)ID(albumIdPrefix + ID)/封面图片对应的顶层容器组(g)ID(coverIdPrefix + ID)
    ///
    function postAlbumOnGellery(id) {
        // 相册对应的顶层容器组(g)ID
        if(id.toString().indexOf(albumIdPrefix) == 0) {
            var s = id;
        } else if(id.toString().indexOf(coverIdPrefix) == 0) { // 相册封面ID
            var s = parentAlbumName(id);
        } else {
            var s = albumIdPrefix + id;
        }

        // 取得相册数据对象
        var album = parentAlbum(s);
        // 展示图片到画廊
        listImages(album.images);

        // 把当前打开的相册记入全局变量
        topAlbumsOnGallery.id = s;

        // 为该相册添加动画，以表示被打开
        animateAlbum(s, true); 

        // 隐藏其他相册
        showHideAlbums(true, true, s);
    }

    ///
    // 把原图片置前显示在画廊上
    // s: 图片对应的顶层容器组(g)ID(imageIdPrefix + ID)
    // g: 图片对应的顶层容器组(g)
    // topImgBgOverlay: 是否背景遮盖层 true: 显示, others: 隐藏
    // showHotspot: 是否显示操作热区 true: 显示, others: 隐藏
    ///
    function showSourceImage(s, g, topImgBgOverlay, showHotspot) {
        // 把当前置前显示图片记入全局变量
        topImageOnGallery.id = s;
        topImageOnGallery.transform = {};
        topImageOnGallery.transform.vTranslate = g.vTranslate; // 元素中心点坐标
        topImageOnGallery.transform.vScale = g.vScale; // 不缩放，显示原图
        topImageOnGallery.transform.styleOpacity = g.style.opacity; // 透明度
        topImageOnGallery.transform.vRotate = g.vRotate; // 旋转

        // 设置变形参数
        g.vTranslate = [galleryViewWidth/2, galleryViewHeight/2]; // 元素中心点坐标 显示到画廊中心
        g.vScale = 1; // 不缩放，显示原图
        g.style.opacity = opacityMaximum; // 透明度
        g.vRotate = 0; // 旋转

        // 是否显示背景遮盖层
        if(topImgBgOverlay) {
            // 显示背景遮盖层
            renderBackgroundOverlay(
                    true, 
                    "dblclick", 
                    function(imgId){
                        return function(){ showHideSourceImage(imgId); };
                    }(s)
            );

            // 把置前图片上升到背景遮盖层之上
            bringToFront(s);
        }

        // 执行变形
        setupTransform(g.id);

        // 降低透明度
        rampOpacity(g, imageDefaultOpacity, imageHoverOpacity);

        // 隐藏操作热区覆盖层
        if(!showHotspot) {
            document.getElementById(s + '-overlay').style.visibility = "hidden";
        }
    }

    ///
    // 把原图片置前显示在画廊上
    // g: 图片对应的顶层容器组(g)
    // initTopImageOnGallery: 是否初始化全局变量 true: 初始化 others: 不初始化
    ///
    function hideSourceImage(s, g, initTopImageOnGallery) {
        // 恢复变形参数
        g.vTranslate = topImageOnGallery.transform.vTranslate; // 元素中心点坐标
        g.vScale = topImageOnGallery.transform.vScale; // 不缩放，显示原图
        g.style.opacity = topImageOnGallery.transform.styleOpacity; // 透明度
        g.vRotate = topImageOnGallery.transform.vRotate; // 旋转

        // 执行变形
        setupTransform(g.id);

        // 降低透明度
        rampOpacity(g, imageDefaultOpacity);

        // 初始化置前图片
        if(initTopImageOnGallery) {
            topImageOnGallery = {};
        }

        // 如果存在，隐藏背景遮盖层
        renderBackgroundOverlay(false);
    }

    ///
    // 把原图片置前显示在画廊上或隐藏
    // imgId: 图片唯一ID/图片对应的顶层容器组(g)ID(imageIdPrefix + ID)
    ///
    function showHideSourceImage(imgId) {
        // 图片对应的顶层容器组(g)ID
        if(imgId.toString().indexOf(imageIdPrefix) == 0) {
            var s = imgId;
        } else {
            var s = imageIdPrefix + imgId;
        }

        var g = document.getElementById(s); // 获取图片对应的顶层容器组(g)

        // 元素未取到，异常返回
        if(!g) return;

        // 已经有图片置前显示，正是当前图片
        if(topImageOnGallery.id == s) {
            // 关闭原图查看
            hideSourceImage(s, g, true);

        } else if(topImageOnGallery.id && topImageOnGallery.id != s) { // 已经有图片置前显示，但不是当前图片
            // 取得当前置前现实的图片
            var on = document.getElementById(topImageOnGallery.id);

            // 恢复当前置前显示的图片
            if(on) {
                // 关闭原图查看
                hideSourceImage(topImageOnGallery.id, on, false);
            }

            // 把当前置前显示图片显示
            showSourceImage(s, g, topImageExclusive, topImageResizable);

        } else { // 未置前显示时，继续执行
            // 把当前置前显示图片显示
            showSourceImage(s, g, topImageExclusive, topImageResizable);

        }
    }

    ///
    // 为相册添加动画，以表示该相册当前被打开
    // aid: 相册唯一ID/图片对应的顶层容器组(g)ID(albumIdPrefix + ID)
    // addMotion: 添加动画 true: 添加 others: 不添加
    ///
    function animateAlbum(aid, addMotion) {
        // 相册对应的顶层容器组(g)ID
        if(aid.toString().indexOf(albumIdPrefix) == 0) {
            var s = aid;
        } else {
            var s = albumIdPrefix + aid;
        }

        // 取得相册
        var g = document.getElementById(s);

        // 查询不到，异常返回
        if(!g) return;

        // 取消被设置的属性
        g.removeAttribute("style");
        g.removeAttribute("opacity");

        // 添加动画
        if(addMotion) {
            // 做一直跳动、且透明度变化处理
            // 透明度变化效果
            var aniOP = document.createElementNS(SVG, 'animate');
            aniOP.setAttribute("id", "topAlbumAniOpacity");
            aniOP.setAttribute("attributeType", "CSS");
            aniOP.setAttribute("attributeName", "opacity");
            aniOP.setAttribute("from", opacityMaximum);
            aniOP.setAttribute("to", albumOpenedOpacity);
            aniOP.setAttribute("dur", "1s");
            aniOP.setAttribute("repeatCount", "indefinite");

            // 跳动效果
            var aniM = document.createElementNS(SVG, 'animateMotion');
            aniM.setAttribute("id", "topAlbumAniMotion");
            aniM.setAttribute("path", "M 0 0 V 10 V 8 V 5 V 3  V0");
            aniM.setAttribute("fill", "freeze");
            aniM.setAttribute("begin", "0s");
            aniM.setAttribute("dur", "1s");
            aniM.setAttribute("repeatCount", "indefinite");

            g.appendChild(aniOP);
            g.appendChild(aniM);
        } else { // 取消动画
            // 透明度变化效果
            var aniOP = document.getElementById("topAlbumAniOpacity");
            if(aniOP) g.removeChild(aniOP);

            // 跳动效果
            var aniM = document.getElementById("topAlbumAniMotion");
            if(aniM) g.removeChild(aniM);
        }
    }

    ///
    // 打开隐藏相册(改变透明度)
    // toShow: 打开相册 true: 打开 others: 关闭
    // animate: 打开隐藏相册的效果 true: 渐变动画 others: 直接设置属性
    // aid: 相册唯一ID/图片对应的顶层容器组(g)ID(albumIdPrefix + ID)
    // --> toShow=true, aid: 打开aid，隐藏其他
    // --> toShow=true     : 隐藏全部
    // --> toShow!=true    : 显示全部
    ///
    function showHideAlbums(toShow, animate, aid) {
        // 显示相册，并且只显示一个
        if(toShow && aid) {
            // 相册对应的顶层容器组(g)ID
            if(aid.toString().indexOf(albumIdPrefix) == 0) {
                var s = aid;
            } else {
                var s = albumIdPrefix + aid;
            }

            for(var i=0; i<albumsOnGallery.length; i++) {
                // 取得相册
                var g = document.getElementById(albumsOnGallery[i].id);

                // 查询不到，异常返回
                if(!g) return;

                // 该相册，显示 
                if(albumsOnGallery[i].id == s) {
                    if(animate) {
                        rampOpacity(g, imageDefaultOpacity);
                    } else {
                        g.style.opacity = imageDefaultOpacity;
                    }
                } else { // 非该相册，隐藏
                    if(animate) {
                        rampOpacity(g, albumClosedOpacity);
                    } else {
                        g.style.opacity = albumClosedOpacity;
                    }
                }
            }
        } else if(toShow) { // 未指定现实的相册，相反地，隐藏所有相册
            for(var i=0; i<albumsOnGallery.length; i++) {
                // 取得相册
                var g = document.getElementById(albumsOnGallery[i].id);

                // 查询不到，异常返回
                if(!g) return;

                // 隐藏
                if(animate) {
                    rampOpacity(g, albumClosedOpacity);
                } else {
                    g.style.opacity = albumClosedOpacity;
                }
            }
        } else { // 显示所有相册
            for(var i=0; i<albumsOnGallery.length; i++) {
                // 取得相册
                var g = document.getElementById(albumsOnGallery[i].id);

                // 查询不到，异常返回
                if(!g) return;

                // 显示
                if(animate) {
                    rampOpacity(g, imageDefaultOpacity);
                } else {
                    g.style.opacity = imageDefaultOpacity;
                }
            }
        }
    }

    ///
    // 构建右键菜单
    // evt: Event 事件
    ///
    function buildContextMenu(evt) {
        // 是否已经存在，存在则删除
        var ext = document.getElementById(contextMenuId);
        if(ext) ext.parentNode.removeChild(ext);

        // 创建菜单容器组(g)
        var ctxMenu = document.createElementNS(SVG, "g"); // 右键菜单容器组(g)
        ctxMenu.setAttribute("id", contextMenuId);

        var itIdx = 0, // 菜单项目序号
            itW = 180, // 菜单项目宽度
            itH = 23; // 菜单项目高度
            itPosX = evt.clientX+2, // 菜单项目基点X坐标
            itPosY = evt.clientY+2, // 菜单项目基点Y坐标
            itClct = [], // 菜单项目集合
            itInfo = {} // 菜单项目对象 {index: ..., id: ..., text: ..., posX: ..., posY: ..., width: ..., height: ..., handler: ..., link: ..., target: ...}
        ; 

        // 计算菜单项目
        // 菜单项目ID格式: contextMenuId + "Item-" + [菜单分类] + {itIdx++}
        // [菜单分类]: 图片: 1, 相册: 2, 所有: 0
        var target = evt.target;

        // 对象是”图片“元素，显示图片操作菜单项
        if(isNodeImage(target)) {
            // 查看原图/关闭查看
            itInfo = {};
            itInfo.type = "1";
            itInfo.index = itIdx++;
            itInfo.id = contextMenuId + "Item-1-" + itInfo.index;

            if(topImageOnGallery.id == baseName(evt)) { // 图片在置前显示
                itInfo.text = "关闭查看";
            } else {
                itInfo.text = "查看原图";
            }

            itInfo.posX = itPosX;
            itInfo.posY = itPosY+(itH*itInfo.index);
            itInfo.width = itW;
            itInfo.height = itH;
            itInfo.handler = function(imgId){
                return function() { showHideSourceImage(imgId); };
            }(baseName(evt));

            itClct[itInfo.index] = itInfo;

            // 在新窗口打开图片
            itInfo = {};
            itInfo.type = "1";
            itInfo.index = itIdx++;
            itInfo.id = contextMenuId + "Item-1-" + itInfo.index;
            itInfo.text = "在新窗口打开图片";
            itInfo.posX = itPosX;
            itInfo.posY = itPosY+(itH*itInfo.index);
            itInfo.width = itW;
            itInfo.height = itH;
            // itInfo.link = getImageOnGallery(baseName(evt)).uri;
            // itInfo.target = "_blank";
            itInfo.handler = function(imgId){
                return function() { window.open(getImageOnGallery(imgId).uri); };
            }(baseName(evt));

            itClct[itInfo.index] = itInfo;

            // 查看图片信息
            itInfo = {};
            itInfo.type = "1";
            itInfo.index = itIdx++;
            itInfo.id = contextMenuId + "Item-1-" + itInfo.index;
            itInfo.text = "查看图片信息";
            itInfo.posX = itPosX;
            itInfo.posY = itPosY+(itH*itInfo.index);
            itInfo.width = itW;
            itInfo.height = itH;
             itInfo.handler = function(imgId){
                return function() { showImageInfo(getImageOnGallery(imgId).uri); };
            }(baseName(evt));

            itClct[itInfo.index] = itInfo;
        }

        // 对象是”图片“元素，显示相册操作菜单项
        if(isNodeAlbum(target)) {
            // 打开相册/关闭相册
            itInfo = {};
            itInfo.type = "2";
            itInfo.index = itIdx++;
            itInfo.id = contextMenuId + "Item-2-" + itInfo.index;

            if(!topAlbumsOnGallery.id || 
                    topAlbumsOnGallery.id &&
                    topAlbumsOnGallery.id != parentAlbumName(baseName(evt))) { // 图片在置前显示
                itInfo.text = "打开相册";

                itInfo.handler = function(coverId){
                        return function() { 
                                clearGallery();  // 清除画廊
                                postAlbumOnGellery(coverId);  // 显示该相册图片
                        };
                }(baseName(evt));
            } else if(topAlbumsOnGallery.id == parentAlbumName(baseName(evt))) {
                itInfo.text = "关闭相册";

                itInfo.handler = function(){ 
                        clearGallery(true);  // 清除画廊
                        topAlbumsOnGallery = {}; // 初始化打开相册
                };
            }

            itInfo.posX = itPosX;
            itInfo.posY = itPosY+(itH*itInfo.index);
            itInfo.width = itW;
            itInfo.height = itH;

            itClct[itInfo.index] = itInfo;

            // 查看相册信息
            itInfo = {};
            itInfo.type = "2";
            itInfo.index = itIdx++;
            itInfo.id = contextMenuId + "Item-2-" + itInfo.index;
            itInfo.text = "查看相册信息";
            itInfo.posX = itPosX;
            itInfo.posY = itPosY+(itH*itInfo.index);
            itInfo.width = itW;
            itInfo.height = itH;
             itInfo.handler = function(coverId){
                return function() { showAlbumInfo(coverId); };
            }(baseName(evt));

            itClct[itInfo.index] = itInfo;
        }

        // 在所有对象上都显示的菜单项目
        // 清空画廊图片
        itInfo = {};
        itInfo.type = "0";
        itInfo.index = itIdx++;
        itInfo.id = contextMenuId + "Item-0-" + itInfo.index;
        itInfo.text = "清空画廊";
        itInfo.posX = itPosX;
        itInfo.posY = itPosY+(itH*itInfo.index);
        itInfo.width = itW;
        itInfo.height = itH;
        itInfo.handler = function(){ 
                clearGallery(); 
        };

        itClct[itInfo.index] = itInfo;

        // 重新加载
        itInfo = {};
        itInfo.type = "0";
        itInfo.index = itIdx++;
        itInfo.id = contextMenuId + "Item-0-" + itInfo.index;
        itInfo.text = "重新加载";
        itInfo.posX = itPosX;
        itInfo.posY = itPosY+(itH*itInfo.index);
        itInfo.width = itW;
        itInfo.height = itH;
        itInfo.handler = function(){
            var win= window.top; 
            win.location.reload();
        };

        itClct[itInfo.index] = itInfo;

        // 关于
        itInfo = {};
        itInfo.type = "9";
        itInfo.index = itIdx++;
        itInfo.id = contextMenuId + "Item-9-" + itInfo.index;
        itInfo.text = "关于";
        itInfo.posX = itPosX;
        itInfo.posY = itPosY+(itH*itInfo.index);
        itInfo.width = itW;
        itInfo.height = itH;
        itInfo.handler = function(){
            // 编辑版本信息
            var infoText = iSvgGallery.name + "\n";
                infoText += "Ver. " + iSvgGallery.version + "\n\n";

                infoText += iSvgGallery.update + "\n";
                infoText += iSvgGallery.site + "\n";

            alert(infoText); // 显示版本信息
        };

        itClct[itInfo.index] = itInfo;

        // 防止菜单显示在画廊以外的区域，调整显示位置
        // 菜单X方向会溢出
        if((itPosX+itW) > galleryViewWidth) {
            for(var i=0; i<itClct.length; i++) {
                itClct[i].posX = itPosX - itW;
            }
        }

        // 菜单Y方向会溢出
        if((itPosY+itH*itClct.length) > galleryViewHeight) {
            for(var i=0; i<itClct.length; i++) {
                itClct[i].posY = itPosY - itH*(itClct.length - itClct[i].index);
            }
        }

        // 将菜单项目集合实现到画面
        for(var i=0; i<itClct.length; i++) {
            // 当前菜单项目与前一个类型不同，插入分割线
            if(i > 0 && itClct[i].type != itClct[i-1].type) {
                ctxMenu.appendChild(createDividingLine(itClct[i].posX, itClct[i].posY, itClct[i].posX+itW, itClct[i].posY));
            }

            // 插入菜单项目
            ctxMenu.appendChild(
                    createCtxMenuItem(
                            itClct[i].index, 
                            itClct[i].id, 
                            itClct[i].text, 
                            itClct[i].posX, 
                            itClct[i].posY, 
                            itClct[i].width, 
                            itClct[i].height, 
                            itClct[i].handler,
                            itClct[i].link,
                            itClct[i].target
                    )
            );
        }

        // 在画廊挂载右键菜单
        document.getElementById(galleryElId).appendChild(ctxMenu);
    }

    ///
    // 创建右键菜单项目
    // index: 菜单上排序
    // itemId: 菜单项目ID
    // itemText: 菜单项目文本
    // x: 菜单项目的基点X坐标
    // y: 菜单项目的基点Y坐标
    // width: 菜单项目的宽度
    // height: 菜单项目的高度
    // handler: 菜单项目的单击处理函数
    // link: 菜单项目直接跳转到一个链接
    // target: 菜单项目链接打开对象
    ///
    function createCtxMenuItem(index, itemId, itemText, x, y, width, height, handler, link, target) {
        var item = document.createElementNS(SVG, "g"); // 菜单项目容器组(g)
        item.setAttribute("id", itemId);

        // 菜单项目高亮处理
        item.addEventListener(
                'mouseover', 
                function(id) {
                        return function(){  
                                var gId = id; // 菜单项目容器组(g)
                                var bdr = document.getElementById(gId+"-border"); // 菜单项目容器组(g)边框
                                var txt = document.getElementById(gId+"-text"); // 菜单项目容器组(g)文本
                                if(bdr) bdr.setAttribute("class", ctxMenuItemHoverClass);
                                if(txt) txt.setAttribute("class", ctxMenuItemTextHoverClass);
                        };
                }(itemId),
                false
        );

        // 菜单项目高亮处理
        item.addEventListener(
                'mouseout', 
                function(id) {
                        return function(){  
                                var gId = id; // 菜单项目容器组(g)
                                var bdr = document.getElementById(gId+"-border"); // 菜单项目容器组(g)边框
                                var txt = document.getElementById(gId+"-text"); // 菜单项目容器组(g)文本
                                if(bdr) bdr.setAttribute("class", ctxMenuItemClass);
                                if(txt) txt.setAttribute("class", ctxMenuItemTextClass);
                        };
                }(itemId),
                false
        );

        // 菜单点击处理
        if(handler) {
            item.addEventListener(
                    'click', 
                    handler,
                    false
            );
        }

        // 菜单项目背景
        var rect = document.createElementNS(SVG, "rect");
        rect.setAttribute("id", itemId+"-border");
        rect.setAttribute("class", ctxMenuItemClass);
        svgSetXYWH(rect, x, y, width, height);

        // 菜单项目文本
        var text = document.createElementNS(SVG, "text");
        text.setAttribute("id", itemId+"-text");
        text.setAttribute("class", ctxMenuItemTextClass);
        svgSetXYWH(text, x+5, y+height-7, width, height);

        // 菜单项目文本加载动画
        // X坐标位置变化
        aniM = document.createElementNS(SVG, 'animateMotion');
        aniM.setAttribute("path", "M "+(-(x+5-width))+" 0 H 0 0");
        aniM.setAttribute("fill", "freeze");
        aniM.setAttribute("begin", 0.2*index+"s");
        aniM.setAttribute("dur", "2s");
        text.appendChild(aniM);
        // 透明度变化
        aniSV = document.createElementNS(SVG, 'animate');
        aniSV.setAttribute("attributeType", "CSS");
        aniSV.setAttribute("attributeName", "opacity");
        aniSV.setAttribute("from", "0.2");
        aniSV.setAttribute("to", opacityMaximum);
        aniSV.setAttribute("begin", 0.2*index+"s");
        aniSV.setAttribute("dur", "2s");
        text.appendChild(aniSV);
        text.appendChild(document.createTextNode(itemText));

        // 链接型菜单项目
        if(!handler && link && target) {
            itlink = document.createElementNS(SVG, 'a');
            itlink.setAttribute('xlink:href', link);
            itlink.setAttribute('href', link);
            itlink.setAttribute('target', target);
            itlink.appendChild(rect); // 为菜单项目添加链接
            itlink.appendChild(text);
            item.appendChild(itlink); // 把菜单项目背景添加到菜单项目容器组(g)中
        } else {
            item.appendChild(rect); // 把菜单项目背景添加到菜单项目容器组(g)中
            item.appendChild(text); // 把菜单项目文本添加到菜单项目容器组(g)中
        }

        return item;
    }

    ///
    // 创建右键菜单项目分隔条
    // x1: 起始点X坐标
    // y1: 起始点Y坐标
    // x2: 终点X坐标
    // y2: 终点Y坐标
    ///
    function createDividingLine(x1, y1 , x2, y2) {
        var ln = document.createElementNS(SVG, "line")
        ln.setAttribute("x1", x1);
        ln.setAttribute("y1", y1);
        ln.setAttribute("x2", x2);
        ln.setAttribute("y2", y2);
        ln.setAttribute("width", 2);
        ln.setAttribute("class", ctxDividingLineClass);

        // 终点的X坐标
        var aniX2 = document.createElementNS(SVG, "animate");
        aniX2.setAttribute("attributeType", "XML");
        aniX2.setAttribute("attributeName", "x2");
        aniX2.setAttribute("from", x1);
        aniX2.setAttribute("to", x2);
        aniX2.setAttribute("fill", "freeze");
        aniX2.setAttribute("begin", "0s");
        aniX2.setAttribute("dur", "0.5s");
        ln.appendChild(aniX2);

        // 终点的Y坐标
        var aniY2 = document.createElementNS(SVG, "animate");
        aniY2.setAttribute("attributeType", "XML");
        aniY2.setAttribute("attributeName", "y2");
        aniY2.setAttribute("from", y1);
        aniY2.setAttribute("to", y2);
        aniY2.setAttribute("fill", "freeze");
        aniY2.setAttribute("begin", "0s");
        aniY2.setAttribute("dur", "0.5s");
        ln.appendChild(aniY2);

        return ln;
    }

    ///
    // 查看相册信息
    // coverId: 相册封面ID
    ///
    function showAlbumInfo(coverId) {
        var aId = parentAlbumName(coverId); // 取得相册ID
        var album = parentAlbum(aId); // 取得相册数据对象

        if(!album) return; // 取得不到，返回

        // 相册信息编辑
        var info = "该相册的信息如下：\n\n";
        info += "名称:        " + album.name + "\n";
        info += "共包含 " + album.images.length + " 张图片。\n\n";
        // 相册当前被打开
        if(topAlbumsOnGallery.id == aId) {
            info += "相册当前处于打开状态。关闭它？";

            // 显示相册信息
            if(confirm(info)) {
                clearGallery(true);  // 清除画廊
                topAlbumsOnGallery = {}; // 初始化打开相册全局变量
            };
        } else {
            info += "您要打开这个相册吗？";

            // 显示相册信息
            if(confirm(info)) {
                clearGallery();  // 清除画廊
                postAlbumOnGellery(aId);  // 显示该相册图片
            }
        }
    }

    ///
    // 判断元素是不是画廊上显示的图片
    // el: 要判断的元素
    ///
    function isNodeImage(el) {
        // 所有与图片有关的元素的id都是以imageIdPrefix开始
        if(el.id.indexOf(imageIdPrefix) == 0) {
            return true;
        } else {
            return false;
        }
    }

    ///
    // 判断元素是不是画廊上显示的相册
    // el: 要判断的元素
    ///
    function isNodeAlbum(el) {
        // 所有与图片有关的元素的id都是以coverIdPrefix开始
        if(el.id.indexOf(coverIdPrefix) == 0) {
            return true;
        } else {
            return false;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    // REGION 功能函数
    //////////////////////////////////////////////////////////////////////////////////////////
    ///
    // 执行变形
    // 将对应元素的变形参数转化成SVG变形语句
    // s: 要执行变形的元素的ID
    ///
    function setupTransform(s) {
        var g = document.getElementById(s);
        var g2 = document.getElementById(s + "-overlay");

        g.setAttribute("transform", "translate(" + g.vTranslate[0] + "," + g.vTranslate[1] + ") " +
                "scale(" + g.vScale + "," + g.vScale + ") " +
                "rotate(" + g.vRotate + ") ");
    }

    ///
    // 计算元素的位移和排列位置 {translate: [x, y], position: [x, y], overflow: true/false}
    // style: 排列风格
    // seatsPerRow: 一行可放置元素数目
    // seatsPerColum: 一列可放置元素数目
    // elWidth: 元素宽度（留给元素显示的逻辑宽度，可能包括边界等）
    // elHeight: 元素高度（留给元素显示的逻辑高度，可能包括边界等）
    // yetPositionedCount: 已经排列完的元素个数
    // areaWidth: 摆放元素的区域宽度
    // areaHeight: 摆放元素的区域高度
    ///
    function calcElementPosition(style, seatsPerRow, seatsPerColum, elWidth, elHeight, yetPositionedCount, areaWidth, areaHeight) {
        var traslateX, translateY; // 相册位移量
        var positionX, positionY; // 相册位置序列 from [0, 0]

        positionX = Math.floor(yetPositionedCount % seatsPerRow);
        positionY = Math.floor(yetPositionedCount / seatsPerRow);

        if(style == listStyleGrid) {
            traslateX = elWidth/2 * (2*positionX + 1);
            translateY = elHeight/2 * (2*positionY + 1);
        } else if(style == listStyleFree) {
            if(areaWidth) {
                traslateX = 100 + Math.random() * (areaWidth - 100); 
            } else {
                traslateX = 100 + Math.random() * 200 + ((yetPositionedCount+1)%3) * 250;
            }

            if(areaHeight) {
                translateY = 70 + Math.random() * (areaHeight - 70);
            } else {
                translateY = 100 + Math.random() * 200 + ((yetPositionedCount+1)/3) * 280;
            }
        } else {
            traslateX = 100 + Math.random() * 300 + ((yetPositionedCount+1)%3) * 250;
            translateY = 100 + Math.random() * 300 + ((yetPositionedCount+1)/3) * 280;
        }

        // 是否超出显示范围
        var overflowed = ((positionX + 1) * (positionY + 1)) > (seatsPerRow * seatsPerColum);

        return {translate: [traslateX, translateY], position: [positionX, positionY], overflow: overflowed};
    }

    ///
    // 设置画廊的当前可见区域大小
    // w: 宽度
    // h: 高度
    ///
    function setGalleryView(w, h) {
        galleryViewWidth = w<galleryMinWidth ? galleryMinWidth : w; // 画廊当前宽度
        galleryViewHeight = h<galleryMinHeight ? galleryMinHeight : h; // 画廊当前高度
    }

    ///
    // 设置画廊的实际大小
    // 采用方格式排列方式，画廊不足够显示时，设置画廊实际大小，把元素排列到不可见区域
    // w: 宽度
    // h: 高度
    ///
    function fixGallerySize(w, h) {
        galleryWidth = w<galleryViewWidth ? galleryViewWidth : w; // 画廊实际宽度
        galleryHeight = h<galleryViewHeight ? galleryViewHeight : h; // 画廊实际高度
        var bodyEl = document.getElementById(bodyElId); // Body标签
        var galleryEl = document.getElementById(galleryElId); // 画廊标签
        // 设置Body，允许溢出
        if(bodyEl) {
            bodyEl.style.overflow = "auto";
        }

        // 设置svg[id=Gallery]，大小等于画廊实际尺寸
        if(galleryEl)
        galleryEl.style.width = galleryWidth;
        galleryEl.style.height = galleryHeight;
//TODO 关闭溢出通知
        alert("当前采用方格式排列方式，画廊没地儿了啦。");
    }

    ///
    // 取得图片初始化边长范围
    // elw: 元素的原始宽度
    // elh: 元素的原始高度
    // 返回值: {width: w, height: h}
    ///
    function getImgInitSideRange(elw, elh) {
        var w = imgInitWRange,
            h = imgInitHRange;

        // galleryViewWidth/galleryMinWidth > 1时，宽度初始化范围乘以该倍数
        if(galleryViewWidth/galleryMinWidth > 1) {
            w = [imgInitWRange[0]*galleryViewWidth/galleryMinWidth, imgInitWRange[1]*galleryViewWidth/galleryMinWidth];
        }

        // galleryViewHeight/galleryMinHeight > 1时，高度初始化范围乘以该倍数
        if(galleryViewHeight/galleryMinHeight > 1) {
            h = [imgInitHRange[0]*galleryViewHeight/galleryMinHeight, imgInitHRange[1]*galleryViewHeight/galleryMinHeight];
        }

        // 图片的边长小于初始化范围时，
        // 初始化范围的上下限都设定为图片的边长
        if(elw > w[0] && elw < w[1]) w[1] = elw; // 宽度
        if(elw <= w[0]) w[0] = w[1] = elw;

        if(elh > h[0] && elh < h[1]) h[1] = elh; // 高度
        if(elh <= h[0]) h[0] = h[1] = elh;

        return {width: w, height: h};
    }

    ///
    // 根据提供填充和触笔，创建一个可点击的rect[x,y,w,h]元素，
    // 并添加鼠标按键按下时处理函数
    // id: 新建rect的ID
    // x: 新建rect的X坐标
    // y: 新建rect的Y坐标
    // w: 新建rect的宽度
    // h: 新建rect的高度
    // fill: 新建rect的填充
    // stroke: 新建rect的笔触
    // handler: 新建rect的mousedown处理函数
    // cssClass: CSS样式类
    ///
    function newClickableRect(id, x, y, w, h, fill, stroke, handler, cssClass) {
        var p = document.createElementNS(SVG, "rect");
        p.setAttribute("id", id);
        svgSetXYWH(p, x, y, w, h);
        p.setAttribute("rx", hotSpotRadius*w/hotSpotSide); // 默认X方向圆角
        p.setAttribute("ry", hotSpotRadius*h/hotSpotSide); // 默认Y方向圆角
        if(cssClass) { // 样式设定
            p.setAttribute("class", cssClass); // 默认X方向圆角
        } else {
            p.setAttribute("fill", fill);
            // p.setAttribute("stroke", stroke);
            // p.setAttribute("stroke-width", 10);
        }
        p.addEventListener("mousedown", handler, false);

        return p;
    }

    ///
    // 创建一个背景者盖层
    // create: 创建背景遮盖层 true: 创建 oters: 隐藏
    // evt: 添加事件类型
    // handler: 添加事件的处理函数
    ///
    function renderBackgroundOverlay(create, evt, handler) {
        var pId = topImageBgOverlayId; // 背景遮盖层元素ID

        // 隐藏背景遮盖层
        if(!create) {
            // 取得背景遮盖层，存在则删除
            var p = document.getElementById(pId);
            if(p) p.parentNode.removeChild(p);

            return;
        }

        // 显示背景遮盖层
        var p = document.createElementNS(SVG, "rect");
        p.setAttribute("id", pId);
        svgSetXYWH(p, 0, 0, "100%", "100%");
        p.setAttribute("fill", "black");
        p.setAttribute("opacity", "0.8");
        p.setAttribute("visibility", "visible");
        if(evt && handler) { // 添加事件处理
            p.addEventListener(evt, handler, false);
        }
        document.getElementById(galleryElId).appendChild(p);

        bringToFront(pId);
    }
    ///
    // 创建一个提示
    // evt: 添加事件类型
    // content: 提示的内容
    // rightNow: 立即显示提示框
    // time: 提示显示的时间
    ///
    function renderTooltip(evt, content, rightNow, time) {
        var cId = baseName(evt); // 相册封面ID
        var aId = parentAlbumName(cId); // 相册ID
        var pId = aId + "-tooltip"; // 提示框元素ID
        var pFun = aId + "-tooltip-function"; // 提示框定时函数ID

        // 是否存在元素，已存在，返回
        // 不要求立即显示提示框，并且设定了再触发函数，返回
        if(document.getElementById(pId) || (!rightNow && globalCache.tooltip[pFun])) {
            return;
        }

        // 不立即显示，设定再触发时间
        if(!rightNow) {
            globalCache.tooltip[pFun] = {};
            globalCache.tooltip[pFun].src = aId; // 触发元素
            globalCache.tooltip[pFun].id = pId; // 提示框元素ID
            globalCache.tooltip[pFun].func  = setTimeout(function(){ 
                    return function(){ 
                            renderTooltip(evt, content, true, time); 
                    };
                }(evt, content, true, time)
                , 
                1022
            ); // 定时递归调用

            return;
        }

        // 提示框项目容器组(g)
        var tooltip = document.createElementNS(SVG, "g"); 
        tooltip.setAttribute("id", pId);

        // 提示框背景 三角形
        // 提示框原点校正，如果可以调整到图片中心
        var cover = document.getElementById(cId); // 取到封面图片
        var album = document.getElementById(aId); // 取到封面图片
        var px = 0, py = 0; // 提示框原点
        if(cover && album && cover.vTranslate && album.vTranslate) { // 取相册中心位置
            px = cover.vTranslate[0] + album.vTranslate[0];
            py = cover.vTranslate[1] + album.vTranslate[1];
        } 
        // 保证提示框原点大于零
        if(px <= 0 || py <= 0 || px > galleryWidth || py > galleryHeight) {
            px = evt.clientX;
            py = evt.clientY;
        }

        // 背景框控制参数
        var triangleH = 20, // 三角形高度
            triangleNX = 20, // 三角形近点X值差
            triangleFX = 50, // 三角形远点X值差
            rectMargin = 20, // 三角形近点和矩形原点X值差
            rectBgH = 35, // 矩形背景框高度
            rectBgW = 100, // 矩形背景框宽度
            textPad = 10, // 文本显示补白

            trianglePoints = "", // 三角形三个点
            rectXY = [], // 矩形框原点
            textXY = [] // 文本原点
        ;

        // 默认位置
        trianglePoints = px + "," + py + " " + (px+triangleNX) + "," + (py-triangleH) + " " + (px+triangleFX) + "," + (py-triangleH);
        rectXY = [px-rectMargin, py-triangleH-rectBgH];
        textXY = [px-rectMargin+textPad, py-triangleH-textPad];

        // X溢出
        if((rectXY[0]+rectBgW) > galleryWidth && rectXY[1] >= 0) {
            trianglePoints = px + "," + py + " " + (px-triangleNX) + "," + (py-triangleH) + " " + (px-triangleFX) + "," + (py-triangleH);
            rectXY = [px+rectMargin-rectBgW, py-triangleH-rectBgH];
            textXY = [px+rectMargin-rectBgW+textPad, py-triangleH-textPad];
        } else if((rectXY[0]+rectBgW) <= galleryWidth && rectXY[1] < 0) { // Y溢出
            trianglePoints = px + "," + py + " " + (px+triangleNX) + "," + (py+triangleH) + " " + (px+triangleFX) + "," + (py+triangleH);
            rectXY = [px-rectMargin, py+triangleH];
            textXY = [px-rectMargin+textPad, py+triangleH+rectBgH-textPad];
        } else if((rectXY[0]+rectBgW) > galleryWidth && rectXY[1] < 0) { // XY溢出
            trianglePoints = px + "," + py + " " + (px-triangleNX) + "," + (py+triangleH) + " " + (px-triangleFX) + "," + (py+triangleH);
            rectXY = [px+rectMargin-rectBgW, py+triangleH];
            textXY = [px+rectMargin-rectBgW+textPad, py+triangleH+rectBgH-textPad];
        }

        var triangleBg = document.createElementNS(SVG, "polygon");
        triangleBg.setAttribute("id", pId+"-triangleBg");
        triangleBg.setAttribute("class", tooltipBackgroundClass);
        triangleBg.setAttribute("points", trianglePoints);
        tooltip.appendChild(triangleBg);

        // 提示框背景 矩形框

        var rectBg = document.createElementNS(SVG, "rect");
        rectBg.setAttribute("id", pId+"-rectBg");
        rectBg.setAttribute("class", tooltipBackgroundClass);
        rectBg.setAttribute("rx", 10); // 默认X方向圆角
        rectBg.setAttribute("ry", 10); // 默认Y方向圆角
        svgSetXYWH(rectBg, rectXY[0], rectXY[1], rectBgW, rectBgH);
        tooltip.appendChild(rectBg);

        // 提示文本
        var text = document.createElementNS(SVG, "text");
        text.setAttribute("id", pId+"-text");
        text.setAttribute("class", tooltipTextClass);
        text.appendChild(document.createTextNode(content));
        svgSetXYWH(text, textXY[0], textXY[1], rectBgW, rectBgH);
        tooltip.appendChild(text);

        // 显示到画廊
        document.getElementById(galleryElId).appendChild(tooltip);

        // 显示一定时间后删除元素
        setTimeout(function(){ 
                document.getElementById(galleryElId).removeChild(tooltip); // 移除其上的提示框
                delete globalCache.tooltip[pFun]; // 删除程序缓冲区数据
            }, 
            (time?time:3000)
        ); // 定时递归调用

        // 把提示框置前
        bringToFront(pId);
    }

    ///
    // 设定元素的X、Y、Width和Height属性的工具函数
    // el: 设定对象
    // x: X坐标
    // y: Y坐标
    // w: 宽度
    // h: 高度
    ///
    function svgSetXYWH(el, x, y, w, h) {
        el.setAttribute("x", x);
        el.setAttribute("y", y);
        el.setAttribute("width", w);
        el.setAttribute("height", h);
    }

    ///
    // 把ID为s的元素放置到最前面
    // s: 元素ID
    ///
    function bringToFront(s) {
        var el = document.getElementById(s);

        // 先删除，后重新添加
        el.parentNode.removeChild(el);
        document.getElementById(galleryElId).appendChild(el);
    }

    ///
    // 操作透明度
    // g: 操作元素
    // d: 目标透明度
    // s: 默认原来的透明度
    /// 
    function rampOpacity(g, d, s) {
        if(!g) return; // 操作元素不存在，返回

        // 如果当前图片正在做透明度变化，将其停止，相反，建立变量
        var opctFuncId = g.id+"-function"; // 透明度变化函数ID
        if(globalCache.opacity[opctFuncId]) {
            // 停止透明度变化
            clearTimeout(globalCache.opacity[opctFuncId].func);
        } else{
            // 初始化透明度变化函数信息
            globalCache.opacity[opctFuncId] = {};
            globalCache.opacity[opctFuncId].id = g.id;
        }

        // 元素初始透明度设置(默认原来的透明度 > 元素当前值 > 1.0)
        g.style.opacity = (s || s == 0) ? parseFloat(s) : (
                (g.style.opacity || g.style.opacity == 0) ? parseFloat(g.style.opacity) : 1.0
            );

        var co = parseFloat(g.style.opacity); // 当前透明度
            fd = parseFloat(d); // 目标透明度

        // 当前透明度相同小于目标透明度
        if(co < fd) {
            rampOpacityUp(g, fd);
        } else if(co > fd) { // 当前透明度相同大于目标透明度
            rampOpacityDown(g, fd);
        }
    }

    ///
    // 提高透明度
    // g: 操作元素
    // opct: 提高透明度，最终透明度:opct
    ///
    function rampOpacityDown(g, opct) {
        if(!g) return; // 操作元素不存在，返回

        // 当前透明度小于目标透明度，不用降值提高透明度
        if(parseFloat(g.style.opacity) <= parseFloat(opct)) { 
            return; 
        }

        // 删除节点的opacity属性设置
        g.removeAttribute("opacity");

        // 透明度变化函数ID
        var opctFuncId = g.id+"-function";
//DEBUG
//globalCache.debug += "[globalCache.opacity[" + opctFuncId + "]: " + globalCache.opacity[opctFuncId] + "][rampOpacityDown] [g.style.opacity: " + g.style.opacity + "][Opacity: " + opct + "]\n\n";
        var rampFunc = function () {
            var o = parseFloat(g.style.opacity) - 0.05;
            g.style.opacity = o;

            if (o > parseFloat(opct)) {
                globalCache.opacity[opctFuncId].func = setTimeout(rampFunc, 10); // 定时递归调用
            } else { // 效果处理完毕，在全局变量域删除定时信息
                delete globalCache.opacity[opctFuncId];
            }
        }

        rampFunc();
    }

    ///
    // 降低透明度
    // g: 操作元素
    // opct: 降低透明度，起始透明度:opct
    ///
    function rampOpacityUp(g, opct) {
        if(!g) return; // 操作元素不存在，返回

        // 当前透明度大于目标透明度，不用升值降低透明度
        if(parseFloat(g.style.opacity) >= parseFloat(opct)) { 
            return; 
        }

        // 删除节点的opacity属性设置
        g.removeAttribute("opacity");

        // 透明度变化函数ID
        var opctFuncId = g.id+"-function";
//DEBUG
//globalCache.debug += "[globalCache.opacity[" + opctFuncId + "]: " + globalCache.opacity[opctFuncId] + "][rampOpacityUp] [g.style.opacity: " + g.style.opacity + "][Opacity: " + opct + "]\n\n";
        var rampFunc = function () {
            var o = parseFloat(g.style.opacity) + 0.05;
            g.style.opacity = o;

            if (o < parseFloat(opct)) {
                globalCache.opacity[opctFuncId].func = setTimeout(rampFunc, 10); // 定时递归调用
            } else { // 效果处理完毕，在全局变量域删除定时信息
                delete globalCache.opacity[opctFuncId];
            }
        }

        rampFunc();
    }

    ///
    // 创建滤镜
    ///
    function createFilters() {
        var defs = document.createElementNS(SVG, "defs"); // 被引用元素的容器

        var gaussianBlur = document.createElementNS(SVG, "filter"); // 高斯滤镜
        gaussianBlur.setAttribute("id", "gaussianBlur");

        var feGaussianBlur = document.createElementNS(SVG, "feGaussianBlur"); // 对图像执行高斯模糊
        gaussianBlur.setAttribute("in", "SourceGraphic");
        gaussianBlur.setAttribute("stdDeviation", "20");
        gaussianBlur.appendChild(feGaussianBlur);

        defs.appendChild(gaussianBlur); // 把高斯滤镜加入到被引用元素容器中

        document.getElementById(galleryElId).appendChild(defs);
    }

    ///
    // 从图片相册的关联关系(relationAI)中取得目标对象对应的顶层容器组(g)的ID
    // s: 元素ID(coverIdPrefix + ID)
    ///
    function parentAlbumName(s) {
        // 图片相册的关联关系(relationAI)中存在，则返回
        if(relationAI && (s in relationAI)) {
            return relationAI[s].parent;
        }

        return null;
    }

    ///
    // 从图片相册的关联关系(relationAI)中取得数据对象中相册的数据对象
    // id: 封面ID(coverIdPrefix + ID)/相册ID(albumIdPrefix + ID)
    ///
    function parentAlbum(id) {
        // 取得相册的ID，判断传入的是否是相册ID
        if(id.indexOf(albumIdPrefix) == 0 ) {
            var s = id;
        } else { // 封面
            var s = parentAlbumName(id);
        }
        if(!s) return; // 取得不到，异常返回
        // 取得相册数据的id，取得不到，异常返回
        if(!(relationAI[s] && (relationAI[s].id || relationAI[s].id == 0))) return;

        var albumData; // 相册数据对象

        // 相册列表其实只是一个相册对象
        if(!(albums instanceof Array)) {
            albumData = albums;
        } else  {
            for(var i=0; i<albums.length; i++) {
                // 取到相册数据
                if(albums[i].id == relationAI[s].id) {
                    albumData = albums[i];
                    break;
                }
            }
        }

        return albumData;
    }

    ///
    // 从事件参数中取得目标对象对应的顶层容器组(g)的ID
    // ev: Event 事件
    ///
    function baseName(ev) {
        var id = ev.target.getAttribute("id");
        return id.substr(0, id.indexOf("-"));
    }

    ///
    // 显示图片信息
    // imgUri: 图片地址
    ///
    function showImageInfo(imgUri) {
        var img = new Image();

        img.onload = function() { 
            // 图片信息编辑
            var info = "该图片的信息如下：\n\n";
            info += "文件:        " + this.src.substr(this.src.lastIndexOf("/")+1, this.src.length) + "图片\n";
            info += "类型:        " + this.src.substr(this.src.lastIndexOf(".")+1, this.src.length).toUpperCase() + "图片\n";
            info += "大小:        未知\n";
            info += "尺寸:        " + this.width + "px × " + this.height + "px\n";
            info += "地址:        " + this.src + "\n\n";
            info += "您要在新窗口打开图片吗？";

            // 显示图片信息
            if(confirm(info)) {
                window.open(this.src);
            }
        };

        // 设置图片地址
        img.src = imgUri;
    }

    ///
    // 浏览器类型
    // type: 浏览器类型 msie opera webkit mozilla
    ///
    function browser(type) {
        // 浏览器字符串 正则表达式
        var rwebkit = /(webkit)[ \/]([\w.]+)/;
        var ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
        var rmsie = /(msie) ([\w.]+)/;
        var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

        // 浏览器字符串
        var userAgent = navigator.userAgent;
            userAgent = userAgent.toLowerCase();

        var match = rwebkit.exec( userAgent ) ||
            ropera.exec( userAgent ) ||
            rmsie.exec( userAgent ) ||
            userAgent.indexOf("compatible") < 0 && rmozilla.exec( userAgent ) || 
            [];

        var result =  { browser: match[1] || "", version: match[2] || "0" };

        if(result.browser == type.toLowerCase()) {
            return result;
        } else {
            return false;
        }
    }

    // 返回共有方法
    return load;
}(iSvgGallery.data);