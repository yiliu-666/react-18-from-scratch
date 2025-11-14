
import hasOwnProperty from "shared/hasOwnProperty";
import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';
function ReactElement(type, key, ref, props) {
    return  {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref,
        props,
    }
}



export function jsxDEV(type, config) {
    let propName; // 属性名
    const props = {}; // 属性对象
    let key = null; // 每个虚拟DOM可以有一个可选的key属性，用来区分一个子节点
    let ref = null; // 引入，后面可以通过这实现获取真实DOM的需求
  
    if (isValidKey(config)) {
      key = config.key;
    }
    if (isValidRef(config)) {
      ref = config.ref;
    }
  
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName) // 确保不是保留属性 (key, ref, __source, __self)
      ) {
        props[propName] = config[propName];
      }
    }
  
    // 返回 ReactElement 对象（即 Virtual DOM 对象）
    return ReactElement(type, key, ref, props);
  }
  
  // 假设的辅助函数和常量（源码中实际定义在其他地方）
  const RESERVED_PROPS = {
      key: true,
      ref: true,
      __self: true,
      __source: true,
  };
  
  function isValidKey(config) {
      return config.key !== undefined;
  }
  
  function isValidRef(config) {
      return config.ref !== undefined;
  }