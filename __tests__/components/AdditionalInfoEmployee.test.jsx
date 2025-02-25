import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AdditionalInfoEmployee from '../../app/(addscreens)/additional-info-employee'
import { mockSupabaseClient, setupMockSession, setupMockSkills, setupMockProfile } from '../utils/mockSupabase'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { router } from 'expo-router'

// Mock the dependencies
jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabaseClient
}))

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn()
  }
}))

jest.mock('expo-image-picker')
jest.mock('expo-document-picker')

const mockSkills = [
  { id: 1, name: 'Photography', category: 'Creative' },
  { id: 2, name: 'Web Development', category: 'Technical' },
  { id: 3, name: 'Customer Service', category: 'Soft Skills' }
]

const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  email: 'test@example.com',
  user_type: 'employee'
}

describe('AdditionalInfoEmployee', () => {
  let supabase

  beforeEach(() => {
    supabase = require('../../lib/supabase').supabase
    supabase._resetMocks()
    setupMockSession()
    setupMockSkills(mockSkills)
    setupMockProfile(mockProfile)
    
    // Reset router mock
    router.push.mockReset()

    // Mock ImagePicker
    ImagePicker.launchImageLibraryAsync.mockReset()
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file://test-image.jpg',
        type: 'image',
        fileName: 'test-image.jpg'
      }]
    })

    // Mock DocumentPicker
    DocumentPicker.getDocumentAsync.mockReset()
    DocumentPicker.getDocumentAsync.mockResolvedValue({
      canceled: false,
      assets: [{
        uri: 'file://test-resume.pdf',
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 1024 // 1MB
      }]
    })
  })

  it('renders correctly with user data', async () => {
    const { getByText, getByPlaceholderText } = render(<AdditionalInfoEmployee />)
    
    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy()
      expect(getByText('SELECT SKILLS')).toBeTruthy()
      expect(getByText('UPLOAD YOUR PWD ID HERE FRONT AND BACK')).toBeTruthy()
      expect(getByText('UPLOAD YOUR RESUME')).toBeTruthy()
    })
  })

  it('handles front ID upload', async () => {
    const { getByText } = render(<AdditionalInfoEmployee />)
    
    const uploadButton = getByText('Upload Front ID')
    fireEvent.press(uploadButton)

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled()
      expect(getByText('test-image.jpg')).toBeTruthy()
    })
  })

  it('handles resume upload', async () => {
    const { getByText } = render(<AdditionalInfoEmployee />)
    
    const uploadButton = getByText('Upload Resume (PDF)')
    fireEvent.press(uploadButton)

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled()
      expect(getByText('test-resume.pdf')).toBeTruthy()
    })
  })

  it('handles skill selection', async () => {
    const { getAllByText } = render(<AdditionalInfoEmployee />)
    
    const dropdowns = getAllByText('Select a Skill')
    fireEvent.press(dropdowns[0])
    fireEvent.press(getAllByText('Photography')[0])

    await waitFor(() => {
      expect(getAllByText('Photography')).toBeTruthy()
    })
  })

  it('handles registration with all required fields', async () => {
    const { getByText, getAllByText } = render(<AdditionalInfoEmployee />)
    
    // Upload front ID
    fireEvent.press(getByText('Upload Front ID'))
    await waitFor(() => expect(getByText('test-image.jpg')).toBeTruthy())

    // Upload back ID
    fireEvent.press(getByText('Upload Back ID'))
    await waitFor(() => expect(getByText('test-image.jpg')).toBeTruthy())

    // Upload resume
    fireEvent.press(getByText('Upload Resume (PDF)'))
    await waitFor(() => expect(getByText('test-resume.pdf')).toBeTruthy())

    // Select skill
    const dropdowns = getAllByText('Select a Skill')
    fireEvent.press(dropdowns[0])
    fireEvent.press(getAllByText('Photography')[0])

    // Submit registration
    fireEvent.press(getByText('REGISTER'))

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/home')
    })
  })

  it('shows error when submitting without required fields', async () => {
    const { getByText } = render(<AdditionalInfoEmployee />)
    
    // Try to register without uploading files or selecting skills
    fireEvent.press(getByText('REGISTER'))

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Please complete all required fields')
    })
  })

  it('handles skip functionality', async () => {
    const { getByText } = render(<AdditionalInfoEmployee />)
    
    fireEvent.press(getByText('SKIP'))

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/home')
    })
  })
})