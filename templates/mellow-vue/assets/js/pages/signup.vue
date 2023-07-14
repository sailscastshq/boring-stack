<script setup>
import { Link, Head, useForm } from '@inertiajs/vue3'
import { ref } from 'vue'

const canSubmit = ref(true)
const form = useForm({
  fullName: null,
  emailAddress: null,
  password: null
})
</script>

<template>
  <Head title="Sign up"></Head>
  <section
    class="min-h-screen bg-gradient-to-b from-brand-50/20 pt-10 text-black"
  >
    <main class="my-10 bg-white px-4 py-8">
      <section
        class="mb-6 flex flex-col items-center justify-center space-y-2 text-center"
      >
        <svg
          class="self-center"
          width="57"
          height="38"
          viewBox="0 0 57 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42.5981 38C40.585 38 39.3448 37.0706 37.3184 35.976C35.292 34.8814 29.4312 30.4743 29.4312 24.9884C29.4312 21.2669 28.4719 18.2569 26.8381 15.8581C25.2166 13.4778 23.0198 11.8286 20.7345 10.6644C19.6332 10.1036 18.4872 9.64488 17.346 9.26581C16.6808 9.04499 16.2947 8.33065 16.5834 7.69203C18.4128 3.64197 22.4871 0.824097 27.22 0.824097C33.6625 0.824097 38.8855 6.04681 38.8855 12.4896C38.8855 13.868 38.6465 15.1907 38.2075 16.4181C40.067 15.165 42.3075 14.4338 44.7183 14.4338C51.1609 14.4338 56.3835 19.6565 56.3835 26.0994C56.3835 33.8555 49.5679 38 42.5981 38Z"
            fill="#6C25C1"
          />
          <path
            d="M0 25.1274C0 31.2765 4.05403 36.4 9.42465 37.532C10.2536 37.8349 11.1486 38.0001 12.0822 38.0001H30.2069C30.8147 38.0001 31.0794 37.1872 30.6153 36.7945C27.4478 34.1143 25.0937 30.3371 25.0937 24.9885C25.0937 22.0496 24.3495 19.9092 23.2531 18.3C22.1443 16.6723 20.5847 15.4558 18.7655 14.5289C16.9294 13.5937 14.936 12.998 13.0324 12.5757C12.5841 12.5191 12.1278 12.4897 11.6655 12.4897C5.22272 12.4897 0 18.1479 0 25.1274Z"
            fill="#6C25C1"
          />
        </svg>

        <h1 class="text-2xl">Create your account</h1>
        <p class="text-lg text-gray">
          Welcome! Please enter your details to sign up
        </p>
      </section>
      <form
        @submit.prevent="form.post('/signup')"
        class="mb-4 flex flex-col space-y-6"
      >
        <label for="fullName" class="relative block"
          ><span class="block text-lg">Name</span>
          <span class="absolute left-2 top-[53%]">
            <svg
              class="h-5 w-5 fill-gray"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_185_224)">
                <path
                  d="M12.6667 0H3.33333C2.4496 0.00105857 1.60237 0.352588 0.97748 0.97748C0.352588 1.60237 0.00105857 2.4496 0 3.33333L0 12.6667C0.00105857 13.5504 0.352588 14.3976 0.97748 15.0225C1.60237 15.6474 2.4496 15.9989 3.33333 16H12.6667C13.5504 15.9989 14.3976 15.6474 15.0225 15.0225C15.6474 14.3976 15.9989 13.5504 16 12.6667V3.33333C15.9989 2.4496 15.6474 1.60237 15.0225 0.97748C14.3976 0.352588 13.5504 0.00105857 12.6667 0ZM4.66667 14.6667V14C4.66667 13.1159 5.01786 12.2681 5.64298 11.643C6.2681 11.0179 7.11595 10.6667 8 10.6667C8.88406 10.6667 9.7319 11.0179 10.357 11.643C10.9821 12.2681 11.3333 13.1159 11.3333 14V14.6667H4.66667ZM14.6667 12.6667C14.6667 13.1971 14.456 13.7058 14.0809 14.0809C13.7058 14.456 13.1971 14.6667 12.6667 14.6667V14C12.6667 12.7623 12.175 11.5753 11.2998 10.7002C10.4247 9.825 9.23768 9.33333 8 9.33333C6.76232 9.33333 5.57534 9.825 4.70017 10.7002C3.825 11.5753 3.33333 12.7623 3.33333 14V14.6667C2.8029 14.6667 2.29419 14.456 1.91912 14.0809C1.54405 13.7058 1.33333 13.1971 1.33333 12.6667V3.33333C1.33333 2.8029 1.54405 2.29419 1.91912 1.91912C2.29419 1.54405 2.8029 1.33333 3.33333 1.33333H12.6667C13.1971 1.33333 13.7058 1.54405 14.0809 1.91912C14.456 2.29419 14.6667 2.8029 14.6667 3.33333V12.6667Z"
                  fill="#878787"
                />
                <path
                  d="M7.99998 2.66669C7.47256 2.66669 6.95699 2.82308 6.51846 3.1161C6.07993 3.40912 5.73814 3.8256 5.5363 4.31286C5.33447 4.80013 5.28166 5.33631 5.38455 5.85359C5.48745 6.37088 5.74142 6.84603 6.11436 7.21897C6.4873 7.59191 6.96246 7.84589 7.47974 7.94878C7.99702 8.05168 8.5332 7.99887 9.02047 7.79703C9.50774 7.5952 9.92422 7.25341 10.2172 6.81487C10.5103 6.37634 10.6666 5.86077 10.6666 5.33335C10.6666 4.62611 10.3857 3.94783 9.8856 3.44774C9.3855 2.94764 8.70723 2.66669 7.99998 2.66669ZM7.99998 6.66669C7.73627 6.66669 7.47849 6.58849 7.25922 6.44198C7.03996 6.29547 6.86906 6.08723 6.76814 5.8436C6.66722 5.59996 6.64082 5.33187 6.69227 5.07323C6.74371 4.81459 6.8707 4.57701 7.05717 4.39054C7.24364 4.20407 7.48122 4.07709 7.73986 4.02564C7.9985 3.97419 8.26659 4.0006 8.51023 4.10151C8.75386 4.20243 8.9621 4.37333 9.10861 4.59259C9.25512 4.81186 9.33331 5.06965 9.33331 5.33335C9.33331 5.68698 9.19284 6.02611 8.94279 6.27616C8.69274 6.52621 8.3536 6.66669 7.99998 6.66669Z"
                  fill="#878787"
                />
              </g>
              <defs>
                <clipPath id="clip0_185_224">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          <input
            type="text"
            id="fullName"
            placeholder="Your name"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:border-gray focus:outline-none focus:ring-1 focus:ring-gray-500"
            v-model="form.fullName"
          />
        </label>
        <label for="email" class="relative block"
          ><span class="block text-lg">Email</span>
          <span class="absolute left-2 top-[53%]">
            <svg
              class="h-5 w-5 fill-gray"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.6667 0.666626H3.33333C2.4496 0.667685 1.60237 1.01921 0.97748 1.64411C0.352588 2.269 0.00105857 3.11623 0 3.99996L0 12C0.00105857 12.8837 0.352588 13.7309 0.97748 14.3558C1.60237 14.9807 2.4496 15.3322 3.33333 15.3333H12.6667C13.5504 15.3322 14.3976 14.9807 15.0225 14.3558C15.6474 13.7309 15.9989 12.8837 16 12V3.99996C15.9989 3.11623 15.6474 2.269 15.0225 1.64411C14.3976 1.01921 13.5504 0.667685 12.6667 0.666626ZM3.33333 1.99996H12.6667C13.0659 2.00074 13.4557 2.12097 13.786 2.34516C14.1163 2.56935 14.3719 2.88726 14.52 3.25796L9.41467 8.36396C9.03895 8.73817 8.53028 8.94827 8 8.94827C7.46972 8.94827 6.96105 8.73817 6.58533 8.36396L1.48 3.25796C1.6281 2.88726 1.88374 2.56935 2.21403 2.34516C2.54432 2.12097 2.93414 2.00074 3.33333 1.99996ZM12.6667 14H3.33333C2.8029 14 2.29419 13.7892 1.91912 13.4142C1.54405 13.0391 1.33333 12.5304 1.33333 12V4.99996L5.64267 9.30663C6.26842 9.9308 7.11617 10.2813 8 10.2813C8.88383 10.2813 9.73158 9.9308 10.3573 9.30663L14.6667 4.99996V12C14.6667 12.5304 14.456 13.0391 14.0809 13.4142C13.7058 13.7892 13.1971 14 12.6667 14Z"
                fill="#878787"
              />
            </svg>
          </span>
          <input
            type="email"
            id="email"
            placeholder="Your email"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:border-gray focus:outline-none focus:ring-1 focus:ring-gray-500"
            v-model="form.emailAddress"
          />
        </label>
        <label for="password" class="relative block"
          ><span class="block text-lg">Password</span>
          <span class="absolute left-2 top-[53%]">
            <svg
              class="h-5 w-5 fill-gray"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_185_119)">
                <path
                  d="M12.6666 5.616V4.66667C12.6666 3.42899 12.175 2.242 11.2998 1.36684C10.4246 0.491665 9.23766 0 7.99998 0C6.7623 0 5.57532 0.491665 4.70015 1.36684C3.82498 2.242 3.33331 3.42899 3.33331 4.66667V5.616C2.73955 5.87514 2.23417 6.30168 1.87898 6.84347C1.52378 7.38527 1.33417 8.01882 1.33331 8.66667V12.6667C1.33437 13.5504 1.6859 14.3976 2.31079 15.0225C2.93568 15.6474 3.78292 15.9989 4.66665 16H11.3333C12.217 15.9989 13.0643 15.6474 13.6892 15.0225C14.3141 14.3976 14.6656 13.5504 14.6666 12.6667V8.66667C14.6658 8.01882 14.4762 7.38527 14.121 6.84347C13.7658 6.30168 13.2604 5.87514 12.6666 5.616ZM4.66665 4.66667C4.66665 3.78261 5.01784 2.93477 5.64296 2.30964C6.26808 1.68452 7.11592 1.33333 7.99998 1.33333C8.88403 1.33333 9.73188 1.68452 10.357 2.30964C10.9821 2.93477 11.3333 3.78261 11.3333 4.66667V5.33333H4.66665V4.66667ZM13.3333 12.6667C13.3333 13.1971 13.1226 13.7058 12.7475 14.0809C12.3725 14.456 11.8637 14.6667 11.3333 14.6667H4.66665C4.13621 14.6667 3.62751 14.456 3.25243 14.0809C2.87736 13.7058 2.66665 13.1971 2.66665 12.6667V8.66667C2.66665 8.13623 2.87736 7.62753 3.25243 7.25245C3.62751 6.87738 4.13621 6.66667 4.66665 6.66667H11.3333C11.8637 6.66667 12.3725 6.87738 12.7475 7.25245C13.1226 7.62753 13.3333 8.13623 13.3333 8.66667V12.6667Z"
                  fill="#878787"
                />
                <path
                  d="M7.99998 9.33337C7.82317 9.33337 7.6536 9.40361 7.52858 9.52864C7.40355 9.65366 7.33331 9.82323 7.33331 10V11.3334C7.33331 11.5102 7.40355 11.6798 7.52858 11.8048C7.6536 11.9298 7.82317 12 7.99998 12C8.17679 12 8.34636 11.9298 8.47138 11.8048C8.59641 11.6798 8.66665 11.5102 8.66665 11.3334V10C8.66665 9.82323 8.59641 9.65366 8.47138 9.52864C8.34636 9.40361 8.17679 9.33337 7.99998 9.33337Z"
                  fill="#878787"
                />
              </g>
              <defs>
                <clipPath id="clip0_185_119">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          <input
            type="password"
            id="password"
            placeholder="Your password"
            class="block w-full rounded-lg border border-gray/50 bg-white py-3 pl-10 pr-3 shadow-sm placeholder:text-lg placeholder:text-gray focus:border-gray focus:outline-none focus:ring-1 focus:ring-gray-500"
            v-model="form.password"
          />
        </label>
        <ul class="flex justify-between text-sm">
          <li class="flex items-center space-x-1 text-gray-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              class="fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_74_1911)">
                <path
                  d="M8 0C3.58867 0 0 3.58867 0 8C0 12.4113 3.58867 16 8 16C12.4113 16 16 12.4113 16 8C16 3.58867 12.4113 0 8 0ZM12.1333 7.008L9.18267 9.90467C8.66067 10.4167 7.98867 10.672 7.316 10.672C6.65067 10.672 5.98533 10.4213 5.46533 9.91933L4.19933 8.67467C3.93667 8.41667 3.93333 7.99467 4.19133 7.732C4.44867 7.46867 4.872 7.46533 5.134 7.724L6.396 8.96467C6.91333 9.46467 7.73 9.462 8.25 8.95267L11.2 6.05667C11.462 5.798 11.8827 5.80267 12.1427 6.06533C12.4007 6.328 12.3967 6.75 12.1333 7.008Z"
                />
              </g>
              <defs>
                <clipPath id="clip0_74_1911">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span>At least 8 characters</span>
          </li>
          <li class="flex items-center space-x-1 text-gray-500">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              class="fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_74_1911)">
                <path
                  d="M8 0C3.58867 0 0 3.58867 0 8C0 12.4113 3.58867 16 8 16C12.4113 16 16 12.4113 16 8C16 3.58867 12.4113 0 8 0ZM12.1333 7.008L9.18267 9.90467C8.66067 10.4167 7.98867 10.672 7.316 10.672C6.65067 10.672 5.98533 10.4213 5.46533 9.91933L4.19933 8.67467C3.93667 8.41667 3.93333 7.99467 4.19133 7.732C4.44867 7.46867 4.872 7.46533 5.134 7.724L6.396 8.96467C6.91333 9.46467 7.73 9.462 8.25 8.95267L11.2 6.05667C11.462 5.798 11.8827 5.80267 12.1427 6.06533C12.4007 6.328 12.3967 6.75 12.1333 7.008Z"
                />
              </g>
              <defs>
                <clipPath id="clip0_74_1911">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span>At least 1 special characters</span>
          </li>
        </ul>
        <p>
          You agree to our
          <a href="/terms" class="font-bold text-brand hover:underline"
            >Terms Of Use</a
          >
          and
          <a href="/privacy-policy" class="font-bold text-brand hover:underline"
            >Privacy Policy</a
          >
        </p>
        <button
          type="submit"
          class="rounded-md bg-brand px-4 py-3 text-white disabled:bg-gray-200/40 disabled:text-gray"
          :disabled="!canSubmit"
        >
          Sign up
        </button>
      </form>
      <Link
        href="/auth/redirect"
        class="flex w-full justify-center space-x-3 rounded-md border border-gray-200 px-4 py-3 text-center text-lg text-gray"
      >
        <svg
          class="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 48 48"
        >
          <defs>
            <path
              id="a"
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
            />
          </defs>
          <clipPath id="b"><use xlink:href="#a" overflow="visible" /></clipPath>
          <path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
          <path
            clip-path="url(#b)"
            fill="#EA4335"
            d="M0 11l17 13 7-6.1L48 14V0H0z"
          />
          <path
            clip-path="url(#b)"
            fill="#34A853"
            d="M0 37l30-23 7.9 1L48 0v48H0z"
          />
          <path
            clip-path="url(#b)"
            fill="#4285F4"
            d="M48 48L17 24l-4-3 35-10z"
          /></svg
        ><span>Continue with Google</span>
      </Link>
    </main>
    <footer class="">
      <p>
        Already have an account?
        <Link href="/login" class="font-bold text-brand hover:underline"
          >Login</Link
        >
      </p>
    </footer>
  </section>
</template>
