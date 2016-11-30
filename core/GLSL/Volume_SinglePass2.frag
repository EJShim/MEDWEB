// uniforms
uniform int uTextureSize;
uniform sampler2D uTextureContainer[7];
uniform ivec3 uDataDimensions;
uniform mat4 uWorldToData;
uniform float uWindowCenterWidth[2];
uniform float uRescaleSlopeIntercept[2];
uniform int uNumberOfChannels;
uniform int uBitsAllocated;
uniform int uInvert;
uniform int uLut;
uniform sampler2D uTextureLUT;
uniform int uPixelType;
uniform int uPackedPerPixel;
uniform int uInterpolation;
uniform float uWorldBBox[6];
uniform int uSteps;
uniform float uAlphaCorrection;
uniform float uFrequence;
uniform float uAmplitude;


// varying (should fetch it from vertex directly)
varying vec4      vPos;

// tailored functions

void texture3d(in ivec3 dataCoordinates, out vec4 dataValue, out int offset){

  int index = dataCoordinates.x
            + dataCoordinates.y * uDataDimensions.x
            + dataCoordinates.z * uDataDimensions.y * uDataDimensions.x;
  int indexP = int(index/uPackedPerPixel);
  offset = index - 2*indexP;

  // Map data index to right sampler2D texture
  int voxelsPerTexture = uTextureSize*uTextureSize;
  int textureIndex = int(floor(float(indexP) / float(voxelsPerTexture)));
  // modulo seems incorrect sometimes...
  // int inTextureIndex = int(mod(float(index), float(textureSize*textureSize)));
  int inTextureIndex = indexP - voxelsPerTexture*textureIndex;

  // Get row and column in the texture
  int colIndex = int(mod(float(inTextureIndex), float(uTextureSize)));
  int rowIndex = int(floor(float(inTextureIndex)/float(uTextureSize)));

  // Map row and column to uv
  vec2 uv = vec2(0,0);
  uv.x = (0.5 + float(colIndex)) / float(uTextureSize);
  uv.y = 1. - (0.5 + float(rowIndex)) / float(uTextureSize);

  //
  if(textureIndex == 0){ dataValue = texture2D(uTextureContainer[0], uv); }
  else if(textureIndex == 1){dataValue = texture2D(uTextureContainer[1], uv);}
  else if(textureIndex == 2){ dataValue = texture2D(uTextureContainer[2], uv); }
  else if(textureIndex == 3){ dataValue = texture2D(uTextureContainer[3], uv); }
  else if(textureIndex == 4){ dataValue = texture2D(uTextureContainer[4], uv); }
  else if(textureIndex == 5){ dataValue = texture2D(uTextureContainer[5], uv); }
  else if(textureIndex == 6){ dataValue = texture2D(uTextureContainer[6], uv); }

}


void uInt16(in float r, in float a, out float value){
  value = r * 256. + a * 65536.;
}


void unpack(in vec4 packedData, in int offset, out vec4 unpackedData){


uInt16(
  packedData.r * float( 1 - offset) + packedData.b * float(offset),
  packedData.g * float( 1 - offset) + packedData.a * float(offset),
  unpackedData.x);


}


void interpolationIdentity(in vec3 currentVoxel, out vec4 dataValue){
  // lower bound
  vec3 rcurrentVoxel = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));
  ivec3 voxel = ivec3(int(rcurrentVoxel.x), int(rcurrentVoxel.y), int(rcurrentVoxel.z));

  vec4 tmp = vec4(0., 0., 0., 0.);
  int offset = 0;

  texture3d(voxel, tmp, offset);
  unpack(tmp, offset, dataValue);
}


void interpolationTrilinear(in vec3 currentVoxel, out vec4 dataValue, out vec3 gradient){

  // https://en.wikipedia.org/wiki/Trilinear_interpolation
  vec3 lower_bound = vec3(floor(currentVoxel.x), floor(currentVoxel.y), floor(currentVoxel.z));
  vec3 higher_bound = lower_bound + vec3(1);

  float xd = ( currentVoxel.x - lower_bound.x ) / ( higher_bound.x - lower_bound.x );
  float yd = ( currentVoxel.y - lower_bound.y ) / ( higher_bound.y - lower_bound.y );
  float zd = ( currentVoxel.z - lower_bound.z ) / ( higher_bound.z - lower_bound.z );

  //
  // c00
  //

  //

  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c000 = vec3(lower_bound.x, lower_bound.y, lower_bound.z);
  interpolationIdentity(c000, v000);
  vec3 g000 = v000.r * vec3(-1., -1., -1.);

  //

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c100 = vec3(higher_bound.x, lower_bound.y, lower_bound.z);
  interpolationIdentity(c100, v100);
  vec3 g100 = v100.r * vec3(1., -1., -1.);

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c001 = vec3(lower_bound.x, lower_bound.y, higher_bound.z);
  interpolationIdentity(c001, v001);
  vec3 g001 = v001.r * vec3(-1., -1., 1.);

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c101 = vec3(higher_bound.x, lower_bound.y, higher_bound.z);
  interpolationIdentity(c101, v101);
  vec3 g101 = v101.r * vec3(1., -1., 1.);

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c010 = vec3(lower_bound.x, higher_bound.y, lower_bound.z);
  interpolationIdentity(c010, v010);
  vec3 g010 = v010.r * vec3(-1., 1., -1.);

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c110 = vec3(higher_bound.x, higher_bound.y, lower_bound.z);
  interpolationIdentity(c110, v110);
  vec3 g110 = v110.r * vec3(1., 1., -1.);

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c011 = vec3(lower_bound.x, higher_bound.y, higher_bound.z);
  interpolationIdentity(c011, v011);
  vec3 g011 = v011.r * vec3(-1., 1., 1.);

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  vec3 c111 = vec3(higher_bound.x, higher_bound.y, higher_bound.z);
  interpolationIdentity(c111, v111);
  vec3 g111 = v111.r * vec3(1., 1., 1.);

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  dataValue = c;

  // compute gradient
  gradient = g000 + g100 + g010 + g110 + g011 + g111 + g110 + g011;
  // gradientMagnitude = length(gradient);
  // // https://en.wikipedia.org/wiki/Normal_(geometry)#Transforming_normals
  // vec3 localNormal = (-1. / gradientMagnitude) * gradient;
  // normal = normalize(normalPixelToPatientundefined * localNormal);
  //normal = gradient;

}


void intersectBox(vec3 rayOrigin, vec3 rayDirection, vec3 boxMin, vec3 boxMax, out float tNear, out float tFar, out bool intersect){
  // compute intersection of ray with all six bbox planes
  vec3 invRay = vec3(1.) / rayDirection;
  vec3 tBot = invRay * (boxMin - rayOrigin);
  vec3 tTop = invRay * (boxMax - rayOrigin);
  // re-order intersections to find smallest and largest on each axis
  vec3 tMin = min(tTop, tBot);
  vec3 tMax = max(tTop, tBot);
  // find the largest tMin and the smallest tMax
  float largest_tMin = max(max(tMin.x, tMin.y), max(tMin.x, tMin.z));
  float smallest_tMax = min(min(tMax.x, tMax.y), min(tMax.x, tMax.z));
  tNear = largest_tMin;
  tFar = smallest_tMax;
  intersect = smallest_tMax > largest_tMin;
}




// main loop

void getIntensity(in vec3 dataCoordinates, out float intensity, out vec3 gradient){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  interpolationTrilinear(dataCoordinates, dataValue, gradient);

  intensity = dataValue.r;

  // rescale/slope
  intensity = intensity*uRescaleSlopeIntercept[0] + uRescaleSlopeIntercept[1];
  // window level
  float windowMin = uWindowCenterWidth[0] - uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

void main(void) {
  const int maxSteps = 1024;

  // the ray
  vec3 rayOrigin = cameraPosition;
  vec3 rayDirection = normalize(vPos.xyz - rayOrigin);

  // the Axe-Aligned B-Box
  vec3 AABBMin = vec3(uWorldBBox[0], uWorldBBox[2], uWorldBBox[4]);
  vec3 AABBMax = vec3(uWorldBBox[1], uWorldBBox[3], uWorldBBox[5]);

  // Intersection ray/bbox
  float tNear, tFar;
  bool intersect = false;
  intersectBox(rayOrigin, rayDirection, AABBMin, AABBMax, tNear, tFar, intersect);
  if (tNear < 0.0) tNear = 0.0;

  // init the ray marching
  float tCurrent = tNear;
  float tStep = (tFar - tNear) / float(uSteps);
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;

  for(int rayStep = 0; rayStep < maxSteps; rayStep++){
    vec3 currentPosition = rayOrigin + rayDirection * tCurrent;
    // some non-linear FUN
    // some occlusion issue to be fixed
    vec3 transformedPosition = currentPosition; //transformPoint(currentPosition, uAmplitude, uFrequence);
    // world to data coordinates
    // rounding trick
    // first center of first voxel in data space is CENTERED on (0,0,0)
    vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);

    if ( all(greaterThanEqual(currentVoxel, vec3(0.0))) &&
         all(lessThan(currentVoxel, vec3(float(uDataDimensions.x), float(uDataDimensions.y), float(uDataDimensions.z))))) {
    // mapped intensity, given slope/intercept and window/level
    float intensity = 0.0;
    vec3 gradient = vec3(0., 0., 0.);
    getIntensity(currentVoxel, intensity, gradient);

    vec4 colorSample;
    float alphaSample;
    if(uLut == 1){
      vec4 colorFromLUT = texture2D( uTextureLUT, vec2( intensity, 1.0) );
      // 256 colors
      colorSample = colorFromLUT;
      alphaSample = colorFromLUT.a;
    }
    else{
      alphaSample = intensity;
      colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
    }

    alphaSample = alphaSample * uAlphaCorrection;
    alphaSample *= (1.0 - accumulatedAlpha);

    accumulatedColor += alphaSample * colorSample;
    accumulatedAlpha += alphaSample;

    }


    tCurrent += tStep;

    if(tCurrent > tFar || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);
}
