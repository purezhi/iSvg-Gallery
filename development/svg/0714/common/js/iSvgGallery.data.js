﻿/********************************************\
    iSvg Gallery
    version: 0.1
    part: data
\********************************************/
iSvgGallery.data = function() {
    // 加载一些图片
    // 额外的，可使用file://加载OSX或者Windows Vista系统的标准壁纸，以作测试用
    try {
        // 当前文件运行在服务器时，加载Flickr的图片
        // 当前文件运行在服务器时，加载Flickr的图片
        if (document.location.toString().indexOf("wangzhiwei.name") != -1) {
            var urlPrefix = document.location.toString().toLowerCase().substring(0, document.location.toString().toLowerCase().lastIndexOf("/")) + "/";
            features = [ urlPrefix+"images/535566372_33c1025c7b_o.jpg",
                    urlPrefix+"images/534271166_db0f114a5d_o.jpg",
                    urlPrefix+"images/313853602_d759910c1e_b.jpg",
                    urlPrefix+"images/313940834_8bf97d364e_b.jpg" ];
            albums = [{id: 0,
                        name: "Family",
                        cover: null,
                        images: [ urlPrefix+"images/family/01a.jpg",
                                    urlPrefix+"images/family/02a.jpg",
                                    urlPrefix+"images/family/03a.jpg",
                                    urlPrefix+"images/family/04a.jpg",
                                    urlPrefix+"images/family/05a.jpg" ]},
                    {id: 1,
                        name: "Hyolee",
                        cover: null,
                        images: [ urlPrefix+"images/hyolee/1.gif",
                                    urlPrefix+"images/hyolee/2.gif",
                                    urlPrefix+"images/hyolee/3.gif",
                                    urlPrefix+"images/hyolee/4.gif",
                                    urlPrefix+"images/hyolee/5.gif",
                                    urlPrefix+"images/hyolee/6.jpg",
                                    urlPrefix+"images/hyolee/7.jpg",
                                    urlPrefix+"images/hyolee/8.jpg" ]},
                    {id: 2,
                        name: "Stars",
                        cover: null,
                        images: [ urlPrefix+"images/stars/ayumi_hamasaki.jpg",
                                    urlPrefix+"images/stars/dream8.jpg",
                                    urlPrefix+"images/stars/f4.jpg",
                                    urlPrefix+"images/stars/faye_wong.jpeg",
                                    urlPrefix+"images/stars/shuqi_linxilei.jpg",
                                    urlPrefix+"images/stars/song_hyekyo_1.jpg",
                                    urlPrefix+"images/stars/song_hyekyo_2.jpg",
                                    urlPrefix+"images/stars/tracy.jpg" ]},
                    {id: 3,
                        name: "Beauty",
                        cover: null,
                        images: [ urlPrefix+"images/girls/g1.jpg",
                                    urlPrefix+"images/girls/g2.png",
                                    urlPrefix+"images/girls/g3.jpg",
                                    urlPrefix+"images/girls/g4.jpg",
                                    urlPrefix+"images/girls/g5.jpg",
                                    urlPrefix+"images/girls/g6.jpg",
                                    urlPrefix+"images/girls/g7.jpg" ]},
                    {id: 4,
                        name: "IT Elite",
                        cover: null,
                        images: [ urlPrefix+"images/it/apple.jpg",
                                    urlPrefix+"images/it/fkjp.jpg",
                                    urlPrefix+"images/it/jobs.jpg",
                                    urlPrefix+"images/it/jobs2.jpg",
                                    urlPrefix+"images/it/linux.jpg",
                                    urlPrefix+"images/it/ms.jpg" ]},
                    {id: 5,
                        name: "Love Story",
                        cover: null,
                        images: [ urlPrefix+"images/love/vkiss.jpg",
                                    urlPrefix+"images/love/lv1.jpg",
                                    urlPrefix+"images/love/lv2.jpg",
                                    urlPrefix+"images/love/lv3.jpg",
                                    urlPrefix+"images/love/lv4.jpg",
                                    urlPrefix+"images/love/lv5.jpg" ]},
                    {id: 6,
                        name: "Nature",
                        cover: null,
                        images: [ urlPrefix+"images/nature/01b.jpg",
                                    urlPrefix+"images/nature/02b.jpg",
                                    urlPrefix+"images/nature/03b.jpg",
                                    urlPrefix+"images/nature/04b.jpg",
                                    urlPrefix+"images/nature/05b.jpg" ]}
            ];
        } else if (document.location.toString().indexOf("http") != -1) {
            features = [ "http://farm1.static.flickr.com/234/535566372_33c1025c7b_o.jpg",
                    "http://farm2.static.flickr.com/1159/534271166_db0f114a5d_o.jpg",
                    "http://farm1.static.flickr.com/120/313853602_d759910c1e_b.jpg",
                    "http://farm1.static.flickr.com/122/313940834_8bf97d364e_b.jpg" ];
        } else if (document.location.toString().toLowerCase().indexOf("users") != -1) { // OSX系统
            features = ["file:///Library/Desktop Pictures/Nature/Flowing Rock.jpg",
                    "file:///Library/Desktop Pictures/Nature/Stones.jpg",
                    "file:///Library/Desktop Pictures/Plants/Lotus.jpg",
                    "file:///Library/Desktop Pictures/Plants/Dandelion.jpg" ];
        } else { // Windows Xp系统
            features = [ "file:///C:/Documents and Settings/All Users/Documents/My Pictures/Sample Pictures/Blue hills.jpg",
                    "file:///C:/Documents and Settings/All Users/Documents/My Pictures/Sample Pictures/Sunset.jpg",
                    "file:///C:/Documents and Settings/All Users/Documents/My Pictures/Sample Pictures/Water lilies.jpg",
                    "file:///C:/Documents and Settings/All Users/Documents/My Pictures/Sample Pictures/Winter.jpg" ];

            var urlPrefix = document.location.toString().toLowerCase().substring(0, document.location.toString().toLowerCase().lastIndexOf("/")) + "/";
            features = [ urlPrefix+"images/535566372_33c1025c7b_o.jpg",
                    urlPrefix+"images/534271166_db0f114a5d_o.jpg",
                    urlPrefix+"images/313853602_d759910c1e_b.jpg",
                    urlPrefix+"images/313940834_8bf97d364e_b.jpg" ];
            albums = [{id: 0,
                        name: "Family",
                        cover: null,
                        images: [ urlPrefix+"images/family/01a.jpg",
                                    urlPrefix+"images/family/02a.jpg",
                                    urlPrefix+"images/family/03a.jpg",
                                    urlPrefix+"images/family/04a.jpg",
                                    urlPrefix+"images/family/05a.jpg" ]},
                    {id: 1,
                        name: "Hyolee",
                        cover: null,
                        images: [ urlPrefix+"images/hyolee/1.gif",
                                    urlPrefix+"images/hyolee/2.gif",
                                    urlPrefix+"images/hyolee/3.gif",
                                    urlPrefix+"images/hyolee/4.gif",
                                    urlPrefix+"images/hyolee/5.gif",
                                    urlPrefix+"images/hyolee/6.jpg",
                                    urlPrefix+"images/hyolee/7.jpg",
                                    urlPrefix+"images/hyolee/8.jpg" ]},
                    {id: 2,
                        name: "Stars",
                        cover: null,
                        images: [ urlPrefix+"images/stars/ayumi_hamasaki.jpg",
                                    urlPrefix+"images/stars/dream8.jpg",
                                    urlPrefix+"images/stars/f4.jpg",
                                    urlPrefix+"images/stars/faye_wong.jpeg",
                                    urlPrefix+"images/stars/shuqi_linxilei.jpg",
                                    urlPrefix+"images/stars/song_hyekyo_1.jpg",
                                    urlPrefix+"images/stars/song_hyekyo_2.jpg",
                                    urlPrefix+"images/stars/tracy.jpg" ]},
                    {id: 3,
                        name: "Beauty",
                        cover: null,
                        images: [ urlPrefix+"images/girls/g1.jpg",
                                    urlPrefix+"images/girls/g2.png",
                                    urlPrefix+"images/girls/g3.jpg",
                                    urlPrefix+"images/girls/g4.jpg",
                                    urlPrefix+"images/girls/g5.jpg",
                                    urlPrefix+"images/girls/g6.jpg",
                                    urlPrefix+"images/girls/g7.jpg" ]},
                    {id: 4,
                        name: "IT Elite",
                        cover: null,
                        images: [ urlPrefix+"images/it/apple.jpg",
                                    urlPrefix+"images/it/fkjp.jpg",
                                    urlPrefix+"images/it/jobs.jpg",
                                    urlPrefix+"images/it/jobs2.jpg",
                                    urlPrefix+"images/it/linux.jpg",
                                    urlPrefix+"images/it/ms.jpg" ]},
                    {id: 5,
                        name: "Love Story",
                        cover: null,
                        images: [ urlPrefix+"images/love/vkiss.jpg",
                                    urlPrefix+"images/love/lv1.jpg",
                                    urlPrefix+"images/love/lv2.jpg",
                                    urlPrefix+"images/love/lv3.jpg",
                                    urlPrefix+"images/love/lv4.jpg",
                                    urlPrefix+"images/love/lv5.jpg" ]},
                    {id: 6,
                        name: "Nature",
                        cover: null,
                        images: [ urlPrefix+"images/nature/01b.jpg",
                                    urlPrefix+"images/nature/02b.jpg",
                                    urlPrefix+"images/nature/03b.jpg",
                                    urlPrefix+"images/nature/04b.jpg",
                                    urlPrefix+"images/nature/05b.jpg" ]}
            ];
        }
    } catch (e) { // 加载时，异常发生，默认加载Flickr的图片
        features = [ "http://farm1.static.flickr.com/234/535566372_33c1025c7b_o.jpg",
                "http://farm2.static.flickr.com/1159/534271166_db0f114a5d_o.jpg",
                "http://farm1.static.flickr.com/120/313853602_d759910c1e_b.jpg",
                "http://farm1.static.flickr.com/122/313940834_8bf97d364e_b.jpg" ];
    }

    return {features: features, albums: albums};

}();