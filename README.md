# threejs-modata-earth
ThreeJS globe for displaying Met Office data sets.

##installation

`$ npm i -g gulp`  
`$ npm install`  
   
##running (dev mode)
   
`$ gulp serve`
  
##known issues
When rebuilding gulp task ordering is required but currently not implemented causing the build to fail.
To solve force a clean first then call the serve task again using:

`$ gulp clean`  
`$ gulp serve`  

##credit
Inspired by the great work of [[http://callumprentice.github.io/][Callum Prentice]] and his [[http://callumprentice.github.io/apps/global_temperature_change_webgl/index.html][Global Temperature Change WebGL]].  
