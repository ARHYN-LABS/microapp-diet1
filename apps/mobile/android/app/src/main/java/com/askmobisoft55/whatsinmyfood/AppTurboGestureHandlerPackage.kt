package com.askmobisoft55.whatsinmyfood

import com.facebook.react.TurboReactPackage
import com.facebook.react.ViewManagerOnDemandReactPackage
import com.facebook.react.bridge.ModuleSpec
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager
import com.swmansion.gesturehandler.react.RNGestureHandlerModule
import com.swmansion.gesturehandler.react.RNGestureHandlerRootViewManager

class AppTurboGestureHandlerPackage :
  TurboReactPackage(),
  ViewManagerOnDemandReactPackage {

  private val viewManagers: Map<String, ModuleSpec> by lazy {
    mapOf(
      RNGestureHandlerRootViewManager.REACT_CLASS to
        ModuleSpec.viewManagerSpec { RNGestureHandlerRootViewManager() },
      RNGestureHandlerButtonViewManager.REACT_CLASS to
        ModuleSpec.viewManagerSpec { RNGestureHandlerButtonViewManager() },
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf<ViewManager<*, *>>(RNGestureHandlerRootViewManager(), RNGestureHandlerButtonViewManager())

  override fun getViewManagerNames(reactContext: ReactApplicationContext) = viewManagers.keys.toList()

  override fun getViewManagers(reactContext: ReactApplicationContext): MutableList<ModuleSpec> =
    viewManagers.values.toMutableList()

  override fun createViewManager(reactContext: ReactApplicationContext, viewManagerName: String) =
    viewManagers[viewManagerName]?.provider?.get() as? ViewManager<*, *>

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == RNGestureHandlerModule.NAME) RNGestureHandlerModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider =
    ReactModuleInfoProvider {
      val reactModule = RNGestureHandlerModule::class.java.getAnnotation(ReactModule::class.java)!!
      mutableMapOf(
        RNGestureHandlerModule.NAME to
          ReactModuleInfo(
            reactModule.name,
            RNGestureHandlerModule::class.java.name,
            reactModule.canOverrideExistingModule,
            reactModule.needsEagerInit,
            reactModule.isCxxModule,
            true,
          ),
      )
    }
}
