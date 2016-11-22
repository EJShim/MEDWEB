uniform int       uTextureSize;
uniform float     uWindowCenterWidth[2];
uniform float     uRescaleSlopeIntercept[2];
uniform sampler2D uTextureContainer[7];
uniform ivec3     uDataDimensions;
uniform mat4      uWorldToData;
uniform int       uNumberOfChannels;
uniform int       uPixelType;
uniform int       uBitsAllocated;
uniform float     uWorldBBox[6];
uniform sampler2D uTextureBack;
uniform int       uSteps;
uniform int       uLut;
uniform sampler2D uTextureLUT;
uniform float     uAlphaCorrection;
uniform float     uFrequence;
uniform float     uAmplitude;
uniform int       uInterpolation;

varying vec4      vPos;
varying vec4      vProjectedCoords;

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

// include functions
void value(in vec3 dataCoordinates,
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
         in int numberOfChannels,
         in int pixelType,
         out vec4 intensity
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
     numberOfChannels,
     pixelType,
     intensity);

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
    numberOfChannels,
    pixelType,
    intensity);

}

}

vec3 transformPoint(const in vec3 samplePoint, const in float frequency, const in float amplitude)
// Apply a spatial transformation to a world space point
{
return samplePoint + amplitude * vec3(samplePoint.x * sin(frequency * samplePoint.z),
                                      samplePoint.y * cos(frequency * samplePoint.z),
                                      0);
}


void getIntensity(in vec3 dataCoordinates, out float intensity){

  vec4 dataValue = vec4(0., 0., 0., 0.);
  int kernelSize = 2;
  value(
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
  // float windowMax = uWindowCenterWidth[0] + uWindowCenterWidth[1] * 0.5;
  intensity = ( intensity - windowMin ) / uWindowCenterWidth[1];
}

void main(void) {
  const int maxSteps = 1024;

  //
  vec2 texc = vec2(((vProjectedCoords.x / vProjectedCoords.w) + 1.0 ) / 2.0,
                ((vProjectedCoords.y / vProjectedCoords.w) + 1.0 ) / 2.0 );
  //The back position is the world space position stored in the texture.
  vec3 backPosNormalized = texture2D(uTextureBack, texc).xyz;
  //
  vec3 backPos = vec3(backPosNormalized.x * (uWorldBBox[1] - uWorldBBox[0]) + uWorldBBox[0],
                     backPosNormalized.y * (uWorldBBox[3] - uWorldBBox[2]) + uWorldBBox[2],
                     backPosNormalized.z * (uWorldBBox[5] - uWorldBBox[4]) + uWorldBBox[4]);
  vec3 frontPos = vec3(vPos.x, vPos.y, vPos.z);

  // init the ray
  vec3 rayDir = backPos - frontPos;
  float rayLength = length(rayDir);

  // init the delta
  float delta = 1.0 / float(uSteps);
  vec3  deltaDirection = rayDir * delta;
  float deltaDirectionLength = length(deltaDirection);

  // init the ray marching
  vec3 currentPosition = frontPos;
  vec4 accumulatedColor = vec4(0.0);
  float accumulatedAlpha = 0.0;
  float accumulatedLength = 0.0;

  // color and alpha at intersection
  vec4 colorSample;
  float alphaSample;
  float gradientLPS = 1.;
  for(int rayStep = 0; rayStep < maxSteps; rayStep++){

    // get data value at given location
    // need a function/polyfill to hide it

    // get texture coordinates of current pixel
    // doesn't need that in theory
    vec3 currentPosition2 = transformPoint(currentPosition, uAmplitude, uFrequence);
    vec4 currentPos4 = vec4(currentPosition2, 1.0);

    vec4 dataCoordinatesRaw = uWorldToData * currentPos4;
    vec3 currentVoxel = vec3(dataCoordinatesRaw.x, dataCoordinatesRaw.y, dataCoordinatesRaw.z);

    if ( all(greaterThanEqual(currentVoxel, vec3(0.0))) &&
         all(lessThan(currentVoxel, vec3(float(uDataDimensions.x), float(uDataDimensions.y), float(uDataDimensions.z))))) {

      float intensity = 0.0;
      getIntensity(currentVoxel, intensity);

      if(uLut == 1){
        vec4 test = texture2D( uTextureLUT, vec2( intensity, 1.0) );
        // 256 colors
        colorSample.r = test.r;//test.a;
        colorSample.g = test.g;//test.a;
        colorSample.b = test.b;///test.a;
        alphaSample = test.a;

      }
      else{
        alphaSample = intensity;
        colorSample.r = colorSample.g = colorSample.b = intensity * alphaSample;
      }

      // alphaSample = alphaSample * uAlphaCorrection;
      // alphaSample *= (1.0 - accumulatedAlpha);
      //
      // // we have the intensity now
      // // colorSample.x = colorSample.y = colorSample.z = intensity;
      // // use a dummy alpha for now
      // // alphaSample = intensity;
      // // if(alphaSample < 0.15){
      // //   alphaSample = 0.;
      // // }
      //
      // //Perform the composition.
      // // (1.0 - accumulatedAlpha) *
      // accumulatedColor += alphaSample * colorSample;// * alphaSample;
      //
      // //Store the alpha accumulated so far.
      // accumulatedAlpha += alphaSample;
      // // accumulatedAlpha += 1.0;
      accumulatedColor += colorSample;
      accumulatedAlpha += alphaSample;

    }

    //Advance the ray.
    currentPosition += deltaDirection;
    accumulatedLength += deltaDirectionLength;

    if(accumulatedLength >= rayLength || accumulatedAlpha >= 1.0 ) break;
  }

  gl_FragColor = vec4(accumulatedColor.xyz, accumulatedAlpha);

}
