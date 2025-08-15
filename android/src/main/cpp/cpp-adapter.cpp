#include <jni.h>
#include "NitroUdpOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::udp::initialize(vm);
}
