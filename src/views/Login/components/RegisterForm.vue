<template>
  <Form
    v-show="getShow"
    :rules="rules"
    :schema="schema"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid) m-0 w-[460px]"
    hide-required-asterisk
    label-position="top"
    size="large"
    @register="register"
    ref="formRef"
  >
    <template #title>
      <LoginFormTitle style="width: 100%" />
    </template>

    <template #code="form">
      <div class="w-[100%] flex">
        <el-input v-model="form['code']" :placeholder="t('login.codePlaceholder')" />
      </div>
    </template>
    <template #codeImg="form">
      <div class="w-[100%] flex">
        <el-input v-model="form['codeImg']" :placeholder="t('login.codeImg')" />
        <CodeImg />
      </div>
    </template>

    <template #register>
      <div class="w-[100%]">
        <XButton
          :loading="loading"
          :title="t('login.register')"
          class="w-[100%]"
          type="primary"
          @click="loginRegister()"
        />
      </div>
      <div class="mt-15px w-[100%]">
        <XButton
          :title="t('login.hasUser')"
          class="w-[100%]"
          @click="handleBackLogin()"
        />
      </div>
    </template>
  </Form>
</template>
<script lang="ts" setup>
import type { FormRules } from "element-plus";

import * as LoginApi from "@/api/login";
import { useForm } from "@/hooks/web/useForm";
import { useValidator } from "@/hooks/web/useValidator";
import { FormSchema } from "@/types/form";
import CodeImg from "./CodeImg.vue";
import LoginFormTitle from "./LoginFormTitle.vue";
import { LoginStateEnum, useLoginState } from "./useLogin";

defineOptions({ name: "RegisterForm" });

const { t } = useI18n();
const { required } = useValidator();
const { register, elFormRef } = useForm();
const { handleBackLogin, getLoginState } = useLoginState();
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);
console.log("🍭[getShow]:", getShow, unref(getLoginState));
const schema = reactive<FormSchema[]>([
  {
    field: "title",
    colProps: {
      span: 24,
    },
  },
  {
    field: "username",
    label: t("login.username"),
    value: "",
    component: "Input",
    colProps: {
      span: 12,
    },
    componentProps: {
      placeholder: t("login.usernamePlaceholder"),
    },
  },
  {
    field: "password",
    label: t("login.password"),
    value: "",
    component: "InputPassword",
    colProps: {
      span: 24,
    },
    componentProps: {
      style: {
        width: "100%",
      },
      strength: true,
      placeholder: t("login.passwordPlaceholder"),
    },
  },
  {
    field: "check_password",
    label: t("login.checkPassword"),
    value: "",
    component: "InputPassword",
    colProps: {
      span: 24,
    },
    componentProps: {
      style: {
        width: "100%",
      },
      strength: true,
      placeholder: t("login.passwordPlaceholder"),
    },
  },
  {
    field: "code",
    label: t("login.code"),
    colProps: {
      span: 24,
    },
  },
  {
    field: "codeImg",
    label: t("login.codeImg"),
    colProps: {
      span: 24,
    },
  },
  {
    field: "register",
    colProps: {
      span: 24,
    },
  },
]);

const rules: FormRules = {
  username: [required()],
  password: [required()],
  check_password: [required()],
  code: [required()],
  codeImg: [required()],
};

const loading = ref(false);

const formRef = ref(); // 表单 Ref
const loginRegister = async () => {
  if (!formRef) return;
  const valid = await formRef.value.getElFormRef().validate();
  console.log("🥨[valid]:", valid, formRef.value.formModel);
  try {
    loading.value = true;
    const res = await LoginApi.register(formRef.value.formModel);
    console.log("🍟[res]:", res);
  } finally {
    loading.value = false;
  }
};
</script>
