require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
var imageDatas = require('../data/imagesData.json');

// let yeomanImage = require('../images/yeoman.png');
//获取图片地址是使用url-loader

//获取图片数据，将图片名信息转为图片URL路径信息
imageDatas =(function getImageURL(imageDatasArr){
  for(var i = 0,j = imageDatasArr.length; i<j ;i++){
    var singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/'+singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

class AppComponent extends React.Component {
  render() {
    return (
      <section className="stage">
        <section className="img-sec">

        </section>
        <section className="controller-nav">

        </section>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
