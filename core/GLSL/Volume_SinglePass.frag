#define GLSLIFY 1
// UNIFORMS
uniform float     uWorldBBox[6];
uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform int       uLut;
uniform sampler2D uTextureLUT;
uniform int       uSteps;
uniform float     uAlphaCorrection;
uniform float     uFrequence;
uniform float     uAmplitude;
uniform int       uInterpolation;

// VARYING
varying vec4 vPos;

// unpack int 8
void uInt8(in float r, out float value){
  value = r * 256.;
}

// unpack int 16
void uInt16(in float r, in float a, out float value){
  value = r * 256. + a * 65536.;
}

// unpack int 32
void uInt32(in float r, in float g, in float b, in float a, out float value){
  value = r * 256. + g * 65536. + b * 16777216. + a * 4294967296.;
}

// unpack float 32
void uFloat32(in float r, in float g, in float b, in float a, out float value){

  // create arrays containing bits for rgba values
  // value between 0 and 255
  value = r * 255.;
  int bytemeR[8];
  bytemeR[0] = int(floor(value / 128.));
  value -= float(bytemeR[0] * 128);
  bytemeR[1] = int(floor(value / 64.));
  value -= float(bytemeR[1] * 64);
  bytemeR[2] = int(floor(value / 32.));
  value -= float(bytemeR[2] * 32);
  bytemeR[3] = int(floor(value / 16.));
  value -= float(bytemeR[3] * 16);
  bytemeR[4] = int(floor(value / 8.));
  value -= float(bytemeR[4] * 8);
  bytemeR[5] = int(floor(value / 4.));
  value -= float(bytemeR[5] * 4);
  bytemeR[6] = int(floor(value / 2.));
  value -= float(bytemeR[6] * 2);
  bytemeR[7] = int(floor(value));

  value = g * 255.;
  int bytemeG[8];
  bytemeG[0] = int(floor(value / 128.));
  value -= float(bytemeG[0] * 128);
  bytemeG[1] = int(floor(value / 64.));
  value -= float(bytemeG[1] * 64);
  bytemeG[2] = int(floor(value / 32.));
  value -= float(bytemeG[2] * 32);
  bytemeG[3] = int(floor(value / 16.));
  value -= float(bytemeG[3] * 16);
  bytemeG[4] = int(floor(value / 8.));
  value -= float(bytemeG[4] * 8);
  bytemeG[5] = int(floor(value / 4.));
  value -= float(bytemeG[5] * 4);
  bytemeG[6] = int(floor(value / 2.));
  value -= float(bytemeG[6] * 2);
  bytemeG[7] = int(floor(value));

  value = b * 255.;
  int bytemeB[8];
  bytemeB[0] = int(floor(value / 128.));
  value -= float(bytemeB[0] * 128);
  bytemeB[1] = int(floor(value / 64.));
  value -= float(bytemeB[1] * 64);
  bytemeB[2] = int(floor(value / 32.));
  value -= float(bytemeB[2] * 32);
  bytemeB[3] = int(floor(value / 16.));
  value -= float(bytemeB[3] * 16);
  bytemeB[4] = int(floor(value / 8.));
  value -= float(bytemeB[4] * 8);
  bytemeB[5] = int(floor(value / 4.));
  value -= float(bytemeB[5] * 4);
  bytemeB[6] = int(floor(value / 2.));
  value -= float(bytemeB[6] * 2);
  bytemeB[7] = int(floor(value));

  value = a * 255.;
  int bytemeA[8];
  bytemeA[0] = int(floor(value / 128.));
  value -= float(bytemeA[0] * 128);
  bytemeA[1] = int(floor(value / 64.));
  value -= float(bytemeA[1] * 64);
  bytemeA[2] = int(floor(value / 32.));
  value -= float(bytemeA[2] * 32);
  bytemeA[3] = int(floor(value / 16.));
  value -= float(bytemeA[3] * 16);
  bytemeA[4] = int(floor(value / 8.));
  value -= float(bytemeA[4] * 8);
  bytemeA[5] = int(floor(value / 4.));
  value -= float(bytemeA[5] * 4);
  bytemeA[6] = int(floor(value / 2.));
  value -= float(bytemeA[6] * 2);
  bytemeA[7] = int(floor(value));

  // compute float32 value from bit arrays

  // sign
  int issigned = 1 - 2 * bytemeR[0];
  //   issigned = int(pow(-1., float(bytemeR[0])));

  // exponent
  int exponent = 0;

  exponent += bytemeR[1] * int(pow(2., 7.));
  exponent += bytemeR[2] * int(pow(2., 6.));
  exponent += bytemeR[3] * int(pow(2., 5.));
  exponent += bytemeR[4] * int(pow(2., 4.));
  exponent += bytemeR[5] * int(pow(2., 3.));
  exponent += bytemeR[6] * int(pow(2., 2.));
  exponent += bytemeR[7] * int(pow(2., 1.));

  exponent += bytemeG[0];

  // fraction
  float fraction = 0.;

  fraction = float(bytemeG[1]) * pow(2., -1.);
  fraction += float(bytemeG[2]) * pow(2., -2.);
  fraction += float(bytemeG[3]) * pow(2., -3.);
  fraction += float(bytemeG[4]) * pow(2., -4.);
  fraction += float(bytemeG[5]) * pow(2., -5.);
  fraction += float(bytemeG[6]) * pow(2., -6.);
  fraction += float(bytemeG[7]) * pow(2., -7.);

  fraction += float(bytemeB[0]) * pow(2., -8.);
  fraction += float(bytemeB[1]) * pow(2., -9.);
  fraction += float(bytemeB[2]) * pow(2., -10.);
  fraction += float(bytemeB[3]) * pow(2., -11.);
  fraction += float(bytemeB[4]) * pow(2., -12.);
  fraction += float(bytemeB[5]) * pow(2., -13.);
  fraction += float(bytemeB[6]) * pow(2., -14.);
  fraction += float(bytemeB[7]) * pow(2., -15.);

  fraction += float(bytemeA[0]) * pow(2., -16.);
  fraction += float(bytemeA[1]) * pow(2., -17.);
  fraction += float(bytemeA[2]) * pow(2., -18.);
  fraction += float(bytemeA[3]) * pow(2., -19.);
  fraction += float(bytemeA[4]) * pow(2., -20.);
  fraction += float(bytemeA[5]) * pow(2., -21.);
  fraction += float(bytemeA[6]) * pow(2., -22.);
  fraction += float(bytemeA[7]) * pow(2., -23.);

  value = float(issigned) * pow( 2., float(exponent - 127)) * (1. + fraction);
}

// entry point for the unpack function
void unpack( in vec4 packedRGBA,
             in int bitsAllocated,
             in int signedNumber,
             in int numberOfChannels,
             in int pixelType,
             out vec4 unpacked) {

  if(numberOfChannels == 1){
    if(bitsAllocated == 8 || bitsAllocated == 1){
      uInt8(
        packedRGBA.r,
        unpacked.x);
    }
    else if(bitsAllocated == 16){
      uInt16(
        packedRGBA.r,
        packedRGBA.a,
        unpacked.x);
    }
    else if(bitsAllocated == 32){
      if(pixelType == 0){
        uInt32(
          packedRGBA.r,
          packedRGBA.g,
          packedRGBA.b,
          packedRGBA.a,
          unpacked.x);
      }
      else{
        uFloat32(
          packedRGBA.r,
          packedRGBA.g,
          packedRGBA.b,
          packedRGBA.a,
          unpacked.x);
      }

    }
  }
  else if(numberOfChannels == 3){
    unpacked = packedRGBA;
  }
}

// Support up to textureSize*textureSize*7 voxels

void texture3DPolyfill(in ivec3 dataCoordinates,
                       in ivec3 dataDimensions,
                       in int textureSize,
                       in sampler2D textureContainer0,
                       in sampler2D textureContainer1,
                       in sampler2D textureContainer2,
                       in sampler2D textureContainer3,
                       in sampler2D textureContainer4,
                       in sampler2D textureContainer5,
                       in sampler2D textureContainer6,
                       in sampler2D textureContainer[7], // not working on Moto X 2014
                       out vec4 dataValue
  ) {

  // Model coordinate to data index
  int index = dataCoordinates.x
            + dataCoordinates.y * dataDimensions.x
            + dataCoordinates.z * dataDimensions.y * dataDimensions.x;

  // Map data index to right sampler2D texture
  int voxelsPerTexture = textureSize*textureSize;
  int textureIndex = int(floor(float(index) / float(voxelsPerTexture)));
  // modulo seems incorrect sometimes...
  // int inTextureIndex = int(mod(float(index), float(textureSize*textureSize)));
  int inTextureIndex = index - voxelsPerTexture*textureIndex;

  // Get row and column in the texture
  int colIndex = int(mod(float(inTextureIndex), float(textureSize)));
  int rowIndex = int(floor(float(inTextureIndex)/float(textureSize)));

  // Map row and column to uv
  vec2 uv = vec2(0,0);
  uv.x = (0.5 + float(colIndex)) / float(textureSize);
  uv.y = 1. - (0.5 + float(rowIndex)) / float(textureSize);

  //
  if(textureIndex == 0){ dataValue = texture2D(textureContainer0, uv); }
  else if(textureIndex == 1){dataValue = texture2D(textureContainer1, uv);}
  else if(textureIndex == 2){ dataValue = texture2D(textureContainer2, uv); }
  else if(textureIndex == 3){ dataValue = texture2D(textureContainer3, uv); }
  else if(textureIndex == 4){ dataValue = texture2D(textureContainer4, uv); }
  else if(textureIndex == 5){ dataValue = texture2D(textureContainer5, uv); }
  else if(textureIndex == 6){ dataValue = texture2D(textureContainer6, uv); }
}

void no(in vec3 currentVoxel,
        in int kernelSize,
        in ivec3 dataDimensions,
        in int textureSize,
        in sampler2D textureContainer0,
        in sampler2D textureContainer1,
        in sampler2D textureContainer2,
        in sampler2D textureContainer3,
        in sampler2D textureContainer4,
        in sampler2D textureContainer5,
        in sampler2D textureContainer6,
        in sampler2D textureContainer[7], // not working on Moto X 2014
        in int bitsAllocated,
        in int numberOfChannels_0,
        in int pixelType_0,
        out vec4 intensity_0
  ) {

  // lower bound - why?
  vec3 rCurrentVoxel = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));
  ivec3 voxel = ivec3(int(rCurrentVoxel.x), int(rCurrentVoxel.y), int(rCurrentVoxel.z));
  ivec3 voxel2 = ivec3( int(currentVoxel.x), int(currentVoxel.y), int(currentVoxel.z) );

  texture3DPolyfill(
    voxel2,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    intensity_0
    );

  unpack(
    intensity_0,
    bitsAllocated,
    0,
    numberOfChannels_0,
    pixelType_0,
    intensity_0);

}

// https://en.wikipedia.org/wiki/Trilinear_interpolation

void trilinear(in vec3 currentVoxel,
               in int kernelSize,
               in ivec3 dataDimensions,
               in int textureSize,
               in sampler2D textureContainer0,
               in sampler2D textureContainer1,
               in sampler2D textureContainer2,
               in sampler2D textureContainer3,
               in sampler2D textureContainer4,
               in sampler2D textureContainer5,
               in sampler2D textureContainer6,
               in sampler2D textureContainer[7], // not working on Moto X 2014
               in int bitsAllocated,
               in int numberOfChannels_1,
               in int pixelType_1,
               out vec4 intensity_1
  ) {

  // lower bound
  vec3 lb = vec3(floor(currentVoxel.x + 0.5 ), floor(currentVoxel.y + 0.5 ), floor(currentVoxel.z + 0.5 ));

  vec3 direction = currentVoxel - lb;

  // higher bound
  vec3 hb = lb + 1.0;

  if( direction.x < 0.0){

    hb.x -= 2.0;

  }

  if( direction.y < 0.0){

    hb.y -= 2.0;

  }

  if( direction.z < 0.0){

    hb.z -= 2.0;

  }

  vec3 lc = vec3(0.0, 0.0, 0.0);
  vec3 hc = vec3(0.0, 0.0, 0.0);

  if(lb.x < hb.x){

    lc.x = lb.x;
    hc.x = hb.x;

  }
  else{

    lc.x = hb.x;
    hc.x = lb.x;

  }

  if(lb.y < hb.y){

    lc.y = lb.y;
    hc.y = hb.y;

  }
  else{

    lc.y = hb.y;
    hc.y = lb.y;

  }

  if(lb.z < hb.z){

    lc.z = lb.z;
    hc.z = hb.z;

  }
  else{

    lc.z = hb.z;
    hc.z = lb.z;

  }

  float xd = ( currentVoxel.x - lc.x ) / ( hc.x - lc.x );
  float yd = ( currentVoxel.y - lc.y ) / ( hc.y - lc.y );
  float zd = ( currentVoxel.z - lc.z ) / ( hc.z - lc.z );

  //
  // c00
  //
  vec4 v000 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c000 = ivec3(int(lc.x), int(lc.y), int(lc.z));

  texture3DPolyfill(
    c000,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v000
    );

  unpack(
    v000,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v000);

  vec4 v100 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c100 = ivec3(int(hc.x), int(lc.y), int(lc.z));

  texture3DPolyfill(
    c100,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v100
    );

  unpack(
    v100,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v100);

  vec4 c00 = v000 * ( 1.0 - xd ) + v100 * xd;

  //
  // c01
  //
  vec4 v001 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c001 = ivec3(int(lc.x), int(lc.y), int(hc.z));

  texture3DPolyfill(
    c001,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v001
    );

  unpack(
    v001,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v001);

  vec4 v101 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c101 = ivec3(int(hc.x), int(lc.y), int(hc.z));

  texture3DPolyfill(
    c101,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v101
    );

  unpack(
    v101,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v101);

  vec4 c01 = v001 * ( 1.0 - xd ) + v101 * xd;

  //
  // c10
  //
  vec4 v010 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c010 = ivec3(int(lc.x), int(hc.y), int(lc.z));

  texture3DPolyfill(
    c010,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v010
    );

  unpack(
    v010,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v010);

  vec4 v110 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c110 = ivec3(int(hc.x), int(hc.y), int(lc.z));

  texture3DPolyfill(
    c110,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v110
    );

  unpack(
    v110,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v110);

  vec4 c10 = v010 * ( 1.0 - xd ) + v110 * xd;

  //
  // c11
  //
  vec4 v011 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c011 = ivec3(int(lc.x), int(hc.y), int(hc.z));

  texture3DPolyfill(
    c011,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v011
    );

  unpack(
    v011,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v011);

  vec4 v111 = vec4(0.0, 0.0, 0.0, 0.0);
  ivec3 c111 = ivec3(int(hc.x), int(hc.y), int(hc.z));

  texture3DPolyfill(
    c111,
    dataDimensions,
    textureSize,
    textureContainer[0],
    textureContainer[1],
    textureContainer[2],
    textureContainer[3],
    textureContainer[4],
    textureContainer[5],
    textureContainer[6],
    textureContainer,     // not working on Moto X 2014
    v111
    );

  unpack(
    v111,
    bitsAllocated,
    0,
    numberOfChannels_1,
    pixelType_1,
    v111);

  vec4 c11 = v011 * ( 1.0 - xd ) + v111 * xd;

  // c0 and c1
  vec4 c0 = c00 * ( 1.0 - yd) + c10 * yd;
  vec4 c1 = c01 * ( 1.0 - yd) + c11 * yd;

  // c
  vec4 c = c0 * ( 1.0 - zd) + c1 * zd;
  intensity_1 = c;

}

// Support up to textureSize*textureSize*7 voxels

void value_0(in vec3 dataCoordinates,
           in int kernelSize,
           in int interpolationMethod,
           in ivec3 dataDimensions,
           in int textureSize,
           in sampler2D textureContainer0,
           in sampler2D textureContainer1,
           in sampler2D textureContainer2,
           in sampler2D textureContainer3,
           in sampler2D textureContainer4,
           in sampler2D textureContainer5,
           in sampler2D textureContainer6,
           in sampler2D textureContainer[7], // not working on Moto X 2014
           in int bitsAllocated,
           in int numberOfChannels_2,
           in int pixelType_2,
           out vec4 intensity_2
  ) {

  //
  // no interpolation for now...
  //

  if( interpolationMethod == 0){

    // no interpolation
    no(dataCoordinates,
       kernelSize,
       dataDimensions,
       textureSize,
       textureContainer0,
       textureContainer1,
       textureContainer2,
       textureContainer3,
       textureContainer4,
       textureContainer5,
       textureContainer6,
       textureContainer,
       bitsAllocated,
       numberOfChannels_2,
       pixelType_2,
       intensity_2);

  }
  else if( interpolationMethod == 1){

    // trilinear interpolation

    trilinear(dataCoordinates,
      kernelSize,
      dataDimensions,
      textureSize,
      textureContainer0,
      textureContainer1,
      textureContainer2,
      textureContainer3,
      textureContainer4,
      textureContainer5,
      textureContainer6,
      textureContainer,
      bitsAllocated,
      numberOfChannels_2,
      pixelType_2,
      intensity_2);

  }

}

vec3 transformPoint(const in vec3 samplePoint, const in float frequency, const in float amplitude)
// Apply a spatial transformation to a world space point
{
  return samplePoint + amplitude * vec3(samplePoint.x * sin(frequency * samplePoint.z),
                                        samplePoint.y * cos(frequency * samplePoint.z),
                                        0);
}

// needed for glslify

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

/**
 * Get voxel value given IJK coordinates.
 * Also apply:
 *  - rescale slope/intercept
 *  - window center/width
 */
void getIntensity(in vec3 dataCoordinates, out float intensity){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  int kernelSize = 2;
  value_0(
    dataCoordinates,
    kernelSize,
    uInterpolation,
    uDataDimensions,
    uTextureSize,
    uTextureContainer[0],
    uTextureContainer[1],
    uTextureContainer[2],
    uTextureContainer[3],
    uTextureContainer[4],
    uTextureContainer[5],
    uTextureContainer[6],
    uTextureContainer,     // not working on Moto X 2014
    uBitsAllocated,
    uNumberOfChannels,
    uPixelType,
    dataValue
  );

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


  vec3 lightSource = vec3(0.0, 0.0, 0.0);


  for(int rayStep = 0; rayStep < maxSteps; rayStep++){
    vec3 currentPosition = rayOrigin + rayDirection * tCurrent;
    // some non-linear FUN
    // some occlusion issue to be fixed
    vec3 transformedPosition = transformPoint(currentPosition, uAmplitude, uFrequence);
    // world to data coordinates
    // rounding trick
    // first center of first voxel in data space is CENTERED on (0,0,0)
    vec4 dataCoordinatesRaw = uWorldToData * vec4(transformedPosition, 1.0);
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);


    if ( all(greaterThanEqual(currentVoxel, vec3(0.0))) &&
         all(lessThan(currentVoxel, vec3(float(uDataDimensions.x), float(uDataDimensions.y), float(uDataDimensions.z))))) {
      // mapped intensity, given slope/intercept and window/level
      float intensity = 0.0;
      getIntensity(currentVoxel, intensity);

      vec4 colorFromLUT = texture2D( uTextureLUT, vec2( intensity, 0.0) );


      accumulatedColor += colorFromLUT  * colorFromLUT.a * (1.0 - accumulatedColor.a);
      //accumulatedColor += colorFromLUT;

    }

    tCurrent += tStep;

    if(tCurrent > tFar || accumulatedColor.a >= 1.0 ){
      break;
    }
  }

  normalize(accumulatedColor);

  gl_FragColor = accumulatedColor;
  //gl_FragColor = vec4(dataColor, accumulatedAlpha);
  return;
}
