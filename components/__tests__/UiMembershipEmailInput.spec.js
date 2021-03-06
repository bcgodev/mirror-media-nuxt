import { shallowMount } from '@vue/test-utils'
import UiMembershipEmailInput from '../UiMembershipEmailInput.vue'

describe('data binding between v-model.trim and vuelidate', function () {
  test('should trim white spaces', async function () {
    expect.assertions(1)
    const wrapper = shallowMount(UiMembershipEmailInput)
    const input = wrapper.find('input')
    const emailWithWhiteSpace = ' example@example.com '
    const emailWithNoWhiteSpace = 'example@example.com'
    await input.setValue(emailWithWhiteSpace)
    expect(wrapper.vm.$v.email.$model).toBe(emailWithNoWhiteSpace)
  })
})

describe('features affect by input state', function () {
  test('should display invalid hint, invalid icon and invalid modifier when input is invalid', async function () {
    expect.assertions(3)
    const wrapper = shallowMount(UiMembershipEmailInput)
    await wrapper.setProps({
      shouldShowInvalidHint: true,
    })
    const input = wrapper.find('input')
    const emailInvalid = 'emailInvalid'
    await input.setValue(emailInvalid)
    const invalidHint = wrapper.find('.invalid-hint')
    const invalidIcon = wrapper.find('.invalid-icon')
    const inputWrapper = wrapper.find('.input-wrapper')
    expect(invalidHint.element.style.display).not.toBe('none')
    expect(invalidIcon.element.style.display).not.toBe('none')
    expect(inputWrapper.classes()).toContain('input-wrapper--invalid')
  })
  test('should not display invalid hint, invalid icon and invalid modifier when input is valid', async function () {
    expect.assertions(3)
    const wrapper = shallowMount(UiMembershipEmailInput)
    await wrapper.setProps({
      shouldShowInvalidHint: true,
    })
    const input = wrapper.find('input')
    const emailValid = 'example@example.com'
    await input.setValue(emailValid)
    const invalidHint = wrapper.find('.invalid-hint')
    const invalidIcon = wrapper.find('.invalid-icon')
    const inputWrapper = wrapper.find('.input-wrapper')
    expect(invalidHint.element.style.display).toBe('none')
    expect(invalidIcon.element.style.display).toBe('none')
    expect(inputWrapper.classes()).not.toContain('input-wrapper--invalid')
  })
  test('should not display invalid hint, invalid icon and invalid modifier when "shouldShowInvalidHint" props is false, even if input is invalid', async function () {
    expect.assertions(3)
    const wrapper = shallowMount(UiMembershipEmailInput)
    await wrapper.setProps({
      shouldShowInvalidHint: false,
    })
    const input = wrapper.find('input')
    const emailInvalid = 'mailInvalid'
    await input.setValue(emailInvalid)
    const invalidHint = wrapper.find('.invalid-hint')
    const invalidIcon = wrapper.find('.invalid-icon')
    const inputWrapper = wrapper.find('.input-wrapper')
    expect(invalidHint.element.style.display).toBe('none')
    expect(invalidIcon.element.style.display).toBe('none')
    expect(inputWrapper.classes()).not.toContain('input-wrapper--invalid')
  })
})

describe('component behaviours', function () {
  test('should emit "input" event with value when input was change', async function () {
    expect.assertions(1)
    const wrapper = shallowMount(UiMembershipEmailInput)
    const input = wrapper.find('input')
    const emailValid = 'example@example.com'
    await input.setValue(emailValid)
    expect(wrapper.emitted().input[0]).toEqual([emailValid])
  })
  test('should emit "inputValidStateChange" event with value when input validation state changed', async function () {
    expect.assertions(1)
    const wrapper = shallowMount(UiMembershipEmailInput)
    const input = wrapper.find('input')
    const emailValid = 'example@example.com'
    await input.setValue(emailValid)
    expect(wrapper.emitted().inputValidStateChange[0]).toEqual([true])
  })
})
