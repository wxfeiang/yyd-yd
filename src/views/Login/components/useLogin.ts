import { Ref } from 'vue';

import { random } from 'lodash-es';
export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  MOBILE,
  QR_CODE,
  SSO,
  FORDET_PASSWOD,
}

const currentState = ref(LoginStateEnum.LOGIN)

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {

    currentState.value = state
  }
  const getLoginState = computed(() => currentState.value)

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN)
  }

  return {
    setLoginState,
    getLoginState,
    handleBackLogin
  }
}

export function useFormValid<T extends Object = any>(formRef: Ref<any>) {
  async function validForm() {
    const form = unref(formRef)
    if (!form) return
    const data = await form.validate()
    return data as T
  }

  return {
    validForm
  }
}
// 验证码相关
const url = ref("");
const flog = ref('');
export const useCode = () => {

  // 获取验证码
  const getCodeImg = async () => {
    console.log('🍑==============');
    // const res = await LoginApi.getCodeImg();
    // url.value = res.data.img;
    // flog.value = res.data.img
    url.value = random(1000, 9999) + "asdcasdcas"
    flog.value = random(10, 99) + "ppppppppppasadsa"
  }
  return {
    getCodeImg, url, flog
  }
}
