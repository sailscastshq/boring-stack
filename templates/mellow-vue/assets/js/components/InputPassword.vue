<script setup>
import { ref } from 'vue'
import InputBase from '@/components/InputBase.vue'

const showPassword = ref(false)

function toggleShowPassword() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <InputBase
    label="Password"
    id="password"
    :type="showPassword ? 'text' : 'password'"
    placeholder="Your password"
  >
    <template #icon>
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
    </template>
    <template #suffix>
      <span class="absolute right-2 top-[57%]">
        <button
          type="button"
          @click="toggleShowPassword"
          aria-label="Toggle Password Visibility"
        >
          <svg
            v-if="!showPassword"
            class="h-5 w-5 fill-gray"
            viewBox="0 0 16 16"
            role="img"
            aria-label="Password is not visible"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- SVG path for hidden password -->
          </svg>
          <svg
            v-else
            class="h-5 w-5 fill-gray"
            viewBox="0 0 16 16"
            role="img"
            aria-label="Password is visible"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- SVG path for visible password -->
          </svg>
        </button>
      </span>
    </template>
  </InputBase>
</template>
