import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import InputField from '../../components/InputField'
import CustomButton from '../../components/CustomButton'
import Dropdown from '../../components/Dropdown'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { supabase } from '../../lib/supabase'

const AdditionalInfoEmployee = () => {
  const [userData, setUserData] = useState(null)
  const [frontIdFile, setFrontIdFile] = useState(null)
  const [backIdFile, setBackIdFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSkills, setAvailableSkills] = useState([])

  useEffect(() => {
    fetchUserProfile()
    fetchAvailableSkills()
    checkBuckets() // Add bucket verification
  }, [])

  const checkBuckets = async () => {
    try {
      // First, verify authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session found')
        return
      }

      // List buckets with proper error handling
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) {
        if (error.message.includes('Permission denied')) {
          console.error('Storage permission denied. Please check Supabase storage policies.')
        } else {
          console.error('Error listing buckets:', error.message)
        }
        return
      }

      if (!buckets || buckets.length === 0) {
        console.error('No buckets found. Please ensure buckets are created in Supabase dashboard.')
        return
      }

      console.log('Available storage buckets:', buckets)
      
      // Test access to required buckets
      const requiredBuckets = ['user_documents', 'resumes']
      for (const bucketName of requiredBuckets) {
        const bucket = buckets.find(b => b.name === bucketName)
        if (!bucket) {
          console.error(`Required bucket '${bucketName}' not found`)
          continue
        }

        const { error: listError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 })

        if (listError) {
          console.error(`Access test failed for bucket '${bucketName}':`, listError.message)
          if (listError.message.includes('Permission denied')) {
            console.error(`Please check storage policies for bucket '${bucketName}'`)
          }
        } else {
          console.log(`Bucket '${bucketName}' is accessible`)
        }
      }
    } catch (error) {
      console.error('Error checking buckets:', error.message)
    }
  }
  const fetchAvailableSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('category', { ascending: true })

      if (error) throw error
      if (data) setAvailableSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }
  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        if (data) setUserData(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }
  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        presentationStyle: 'fullScreen',
        selectionLimit: 1,
      })
    
      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0]
        const uri = asset.uri
        const fileType = asset.uri.split('.').pop().toLowerCase()
        const validImageTypes = ['jpg', 'jpeg', 'png', 'heic', 'heif']
        
        if (!validImageTypes.includes(fileType)) {
          alert('Please select a valid image file (JPG, PNG, HEIC)')
          return
        }
    
        if (type === 'front') {
          setFrontIdFile({ uri, name: `front_id.${fileType}`, type: `image/${fileType}` })
        } else {
          setBackIdFile({ uri, name: `back_id.${fileType}`, type: `image/${fileType}` })
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
      alert('Failed to pick image. Please try again.')
    }
  }
  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true
      })
    
      if (result.assets && result.assets[0]) {
        const file = result.assets[0]
        // Validate file size (max 10MB)
        const fileSize = file.size
        const maxSize = 10 * 1024 * 1024 // 10MB
    
        if (fileSize > maxSize) {
          alert('File size must be less than 10MB')
          return
        }
    
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          alert('Only PDF files are allowed')
          return
        }
    
        setResumeFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: fileSize
        })
      } else if (result.canceled) {
        console.log('Document picking cancelled')
      }
    } catch (error) {
      console.error('Error picking document:', error)
      alert('Failed to pick document. Please try again.')
    }
  }
  const handleSelect = (selectedItem) => {
    if (!selectedSkills.includes(selectedItem)) {
      const skill = availableSkills.find(s => s.name === selectedItem)
      if (skill) {
        setSelectedSkills([...selectedSkills, skill.id])
      }
    }
  }
  const uploadFile = async (uri, path, fileType) => {
    const maxRetries = 5;
    let attempt = 0;
    const timeout = 60000; // 60 seconds timeout
    let controller = new AbortController();
    let timeoutId;
  
    const checkConnectivity = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return false;
  
        const response = await fetch(`${supabase.supabaseUrl}/storage/v1/object/sign/${fileType === 'resume' ? 'resumes' : 'user_documents'}/${path}`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        return response.ok;
      } catch (error) {
        console.error('Storage connectivity check failed:', error);
        return false;
      }
    };
  
    const initializeBucket = async (bucketName) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');
  
        // First, check if the bucket exists and is accessible
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
          console.error('Error listing buckets:', bucketsError);
          throw new Error('Unable to access storage buckets');
        }
  
        const bucket = buckets.find(b => b.name === bucketName);
        if (!bucket) {
          throw new Error(`Bucket ${bucketName} not found. Please check your storage configuration.`);
        }
  
        // Test bucket permissions
        const { error: listError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
  
        if (listError) {
          if (listError.message.includes('Permission denied')) {
            throw new Error(`Permission denied for bucket ${bucketName}. Please check your storage policies.`);
          }
          throw listError;
        }
  
        return true;
      } catch (error) {
        console.error(`Bucket initialization failed for ${bucketName}:`, error);
        throw error;
      }
    };
  
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      controller.abort();
    };
  
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    try {
      while (attempt < maxRetries) {
        try {
          const isConnected = await checkConnectivity();
          if (!isConnected) {
            throw new Error('Storage service is not accessible. Please check your network connection.');
          }
  
          const bucketName = fileType === 'resume' ? 'resumes' : 'user_documents';
          await initializeBucket(bucketName);
  
          controller = new AbortController();
          timeoutId = setTimeout(() => controller.abort(), timeout);
  
          const response = await fetch(uri, { signal: controller.signal });
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
  
          const blob = await response.blob();
          if (!blob || blob.size === 0) {
            throw new Error('Invalid file data: Empty or corrupted file');
          }
  
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (blob.size > maxSize) {
            throw new Error('File size exceeds maximum allowed (10MB)');
          }
  
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(path, blob, {
              contentType: fileType === 'resume' ? 'application/pdf' : 'image/jpeg',
              cacheControl: '3600',
              upsert: true
            });
  
          if (uploadError) {
            console.error('Upload error:', uploadError);
            if (uploadError.message.includes('Permission denied')) {
              throw new Error('Storage permission denied. Please contact support.');
            }
            throw uploadError;
          }
  
          console.log(`Successfully uploaded ${fileType} to ${bucketName}`);
          return path;
        } catch (error) {
          attempt++;
          cleanup();
  
          if (error.name === 'AbortError') {
            throw new Error('File upload timed out. Please try again.');
          }
  
          if (attempt === maxRetries) {
            throw error;
          }
  
          const jitter = Math.random() * 1000;
          const backoffTime = Math.min(1000 * Math.pow(2, attempt) + jitter, 30000);
          await wait(backoffTime);
          console.log(`Retrying upload attempt ${attempt} of ${maxRetries}...`);
        }
      }
    } finally {
      cleanup();
    }
  };
  const register = async () => {
    if (!frontIdFile || !backIdFile || !resumeFile || selectedSkills.length === 0) {
      alert('Please complete all required fields')
      return
    }
  
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No user session')

      const userId = session.user.id
      const timestamp = new Date().getTime()

      // Upload files
      const frontIdPath = `${userId}/pwd_id/${timestamp}_front.jpg`
      const backIdPath = `${userId}/pwd_id/${timestamp}_back.jpg`
      const resumePath = `${userId}/resume/${timestamp}_${resumeFile.name}`

      await Promise.all([
        uploadFile(frontIdFile.uri, frontIdPath, 'pwd_id'),
        uploadFile(backIdFile.uri, backIdPath, 'pwd_id'),
        uploadFile(resumeFile.uri, resumePath, 'resume')
      ])

      // Update user profile with file paths
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          pwd_id_front: frontIdPath,
          pwd_id_back: backIdPath,
          resume_url: resumePath
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Add user skills
      const skillPromises = selectedSkills.map(skillName =>
        supabase.from('user_skills').insert({
          user_id: userId,
          skill_id: skillName // Note: In production, you'd need to map skill names to actual skill IDs
        })
      )

      await Promise.all(skillPromises)

      router.push('/home')
    } catch (error) {
      console.error('Error during registration:', error)
      alert('Failed to complete registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const skip = () => {
    router.push('/home')
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className = "w-full justify-center h-auto px-4 my-4 min-h-[vh]">
          <InputField 
            title='Name'
            value={userData?.full_name}
            placeholder={'John Doe'}
            editType={false}
          />
  
          <View className="mt-7">
            <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD YOUR PWD ID HERE FRONT AND BACK</Text>
            
            <TouchableOpacity onPress={() => pickImage('front')} className="mb-2">
              <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
                <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
                  {frontIdFile ? frontIdFile.name : 'Upload Front ID'}
                </Text>
              </View>
            </TouchableOpacity>
  
            <TouchableOpacity onPress={() => pickImage('back')}>
              <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
                <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
                  {backIdFile ? backIdFile.name : 'Upload Back ID'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
  
          <View className="mt-7">
            <Text className="text-base text-tcolor font-lexend-bold mb-2">UPLOAD YOUR RESUME</Text>
            <TouchableOpacity onPress={pickResume}>
              <View className="border-2 w-full h-16 px-4 bg-inputField rounded-2xl flex-row items-center justify-between">
                <Text className="flex-1 text-tcolor font-lexend-semibold text-base">
                  {resumeFile ? resumeFile.name : 'Upload Resume (PDF)'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
  
          {/* <View className = "mt-7">
            <InputField
              title='LIST YOUR SKILLS'
              placeholder={'Skill 1'}
              editType={true} // Property I set to make this non editable or not (false = not editable, True = editable)
            />
            <InputField
              placeholder={'Skill 1'}
              editType={true} // Property I set to make this non editable or not (false = not editable, True = editable)
            />           
            <InputField
              placeholder={'Skill 1'}
              editType={true} // Property I set to make this non editable or not (false = not editable, True = editable)
            />
          </View> */}
  

          <View className="mt-2">
            <Dropdown
              otherStyles='mt-5'
              title='SELECT SKILLS'
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={handleSelect}
            />
            <Dropdown
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={handleSelect}
            />
            <Dropdown
              options={availableSkills.map(skill => skill.name)}
              placeholder="Select a Skill"
              onSelect={handleSelect}
            />
          </View>
          <View className="flex-row justify-center  mt-5">
            <CustomButton 
              title="SKIP"
              handlePress={skip}
              containerStyles="w-44 mr-8 "
              isLoading={isSubmitting}
              textStyles="font-lexend-bold"
            />
            <CustomButton 
              title="REGISTER"
              handlePress={register}
              containerStyles="w-44"
              isLoading={isSubmitting}
              textStyles="font-lexend-bold"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AdditionalInfoEmployee