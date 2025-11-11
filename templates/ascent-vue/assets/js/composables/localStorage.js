import { ref, watch, onMounted } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = ref(initialValue)

  onMounted(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  })

  watch(storedValue, (newValue) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  })

  return storedValue
}
