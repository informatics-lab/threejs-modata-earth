# threejs-modata-earth
ThreeJS globe for displaying Met Office data sets.

##installation

`$ npm i -g gulp`  
`$ npm install`  
   
##running (dev mode)
   
`$ gulp serve`
  
##building

`$ gulp build`
  
##known issues
When rebuilding gulp task ordering is required but currently not implemented causing the build to fail.
To solve force a clean first then call the serve task again using:

`$ gulp clean`  
`$ gulp serve`  

##credit
Inspired by the great work of [Callum Prentice](http://callumprentice.github.io/) and his [Global Temperature Change WebGL](http://callumprentice.github.io/apps/global_temperature_change_webgl/index.html).  
