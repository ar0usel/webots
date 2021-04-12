import {GTAO_LEVEL} from './wbPreferences.js';
import {WbWorld} from './wbWorld.js';
import {WbWrenPostProcessingEffects} from './../wren/wbWrenPostProcessingEffects.js';
import {WbWrenShaders} from './../wren/wbWrenShaders.js';

class WbScene {
  constructor(smaaAreaTexture, smaaSearchTexture, gtaoNoiseTexture) {
    _wrjs_init_context(canvas.clientWidth, canvas.clientHeight);

    _wr_scene_init(_wr_scene_get_instance());

    _wr_gl_state_set_context_active(true);

    this.updateFrameBuffer();

    _wr_scene_set_fog_program(_wr_scene_get_instance(), WbWrenShaders.fogShader());
    _wr_scene_set_shadow_volume_program(_wr_scene_get_instance(), WbWrenShaders.shadowVolumeShader());

    WbWrenPostProcessingEffects.loadResources(smaaAreaTexture, smaaSearchTexture, gtaoNoiseTexture);
    this.updateWrenViewportDimensions();
  }

  updateFrameBuffer() {
    if (typeof this.wrenMainFrameBuffer !== 'undefined')
      _wr_frame_buffer_delete(this.wrenMainFrameBuffer);

    if (typeof this.wrenMainFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenMainFrameBufferTexture);

    if (typeof this.wrenNormalFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenNormalFrameBufferTexture);

    if (typeof this.wrenDepthFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenDepthFrameBufferTexture);

    this.wrenMainFrameBuffer = _wr_frame_buffer_new();
    _wr_frame_buffer_set_size(this.wrenMainFrameBuffer, canvas.width, canvas.height);

    this.wrenMainFrameBufferTexture = _wr_texture_rtt_new();
    _wr_texture_set_internal_format(this.wrenMainFrameBufferTexture, ENUM.WR_TEXTURE_INTERNAL_FORMAT_RGBA16F);

    this.wrenNormalFrameBufferTexture = _wr_texture_rtt_new();

    _wr_texture_set_internal_format(this.wrenNormalFrameBufferTexture, ENUM.WR_TEXTURE_INTERNAL_FORMAT_RGBA8);
    _wr_frame_buffer_append_output_texture(this.wrenMainFrameBuffer, this.wrenMainFrameBufferTexture);
    if (GTAO_LEVEL < 1)
      _wr_frame_buffer_append_output_texture_disable(this.wrenMainFrameBuffer, this.wrenNormalFrameBufferTexture);
    else
      _wr_frame_buffer_append_output_texture(this.wrenMainFrameBuffer, this.wrenNormalFrameBufferTexture);
    _wr_frame_buffer_enable_depth_buffer(this.wrenMainFrameBuffer, true);

    this.wrenDepthFrameBufferTexture = _wr_texture_rtt_new();
    _wr_texture_set_internal_format(this.wrenDepthFrameBufferTexture, ENUM.WR_TEXTURE_INTERNAL_FORMAT_DEPTH24_STENCIL8);
    _wr_frame_buffer_set_depth_texture(this.wrenMainFrameBuffer, this.wrenDepthFrameBufferTexture);

    _wr_frame_buffer_setup(this.wrenMainFrameBuffer);
    _wr_viewport_set_frame_buffer(_wr_scene_get_viewport(_wr_scene_get_instance()), this.wrenMainFrameBuffer);

    _wr_viewport_set_size(_wr_scene_get_viewport(_wr_scene_get_instance()), canvas.width, canvas.height);
  }

  updateWrenViewportDimensions() {
    _wr_viewport_set_pixel_ratio(_wr_scene_get_viewport(_wr_scene_get_instance()), 1);
  }

  destroy() {
    WbWrenPostProcessingEffects.clearResources();

    if (typeof this.wrenMainFrameBuffer !== 'undefined')
      _wr_frame_buffer_delete(this.wrenMainFrameBuffer);

    if (typeof this.wrenMainFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenMainFrameBufferTexture);

    if (typeof this.wrenNormalFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenNormalFrameBufferTexture);

    if (typeof this.wrenDepthFrameBufferTexture !== 'undefined')
      _wr_texture_delete(this.wrenDepthFrameBufferTexture);

    this.wrenMainFrameBuffer = undefined;
    this.wrenMainFrameBufferTexture = undefined;
    this.wrenNormalFrameBufferTexture = undefined;
    this.wrenDepthFrameBufferTexture = undefined;

    _wr_scene_destroy();

    WbWorld.instance.scene = undefined;
  }
}

export {WbScene};
