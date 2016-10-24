# threejs-modata-earth
ThreeJS globe for displaying Met Office data sets.

##installation

`$ npm i -g gulp`  
`$ npm install`  
   
##running
   
`$ gulp serve`
  
##known issues
When rebuilding gulp task ordering is required but currently not implemented causing the build to fail.
To solve force a clean first then call the serve task again using:

`$ gulp clean`  
`$ gulp serve`  

