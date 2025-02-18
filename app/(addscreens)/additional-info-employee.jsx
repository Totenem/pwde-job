import { View, Text, ScrollView,} from 'react-native'
import React from 'react'
import { useState } from 'react'
import InputField from '../../components/InputField'
import CustomButton from '../../components/CustomButton'
import Dropdown from '../../components/Dropdown'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const AdditionalInfoEmployee = () => {

  // Function for teh dropdown
  const skill = ['Photography', 'Photoshop', 'Sewing', 'Painting', 'Labour', 'Data Entry', 'Customer Rep'];

  const handleSelect = (selectedItem) => {
    console.log('Selected:', selectedItem);
  };

  // Function for the button
  const [isSubmitting, setisSubmitting] = useState(false)


  const skip = () =>{
    router.push('/home')
  }

  const register = () =>{
    router.push('/home')
  }

  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className = "w-full justify-center h-auto px-4 my-4 min-h-[vh]">
          <InputField 
            title='Name'
            placeholder={'John Doe'}
            editType={false} // Property I set to make this non editable or not (false = not editable, True = editable)
          />


          <View className = "mt-7">
          <InputField
            title='UPLOAD YOUR PROFILE'
            placeholder={'Upload Here'}
            editType={false} // Property I set to make this non editable or not (false = not editable, True = editable)
          />
          </View>


          <View className = "mt-7">
            <InputField
              title='UPLOAD YOUR PWD ID HERE FRONT AND BACK'
              placeholder={'Front'}
              editType={false} // Property I set to make this non editable or not (false = not editable, True = editable)
            />
            <InputField
              placeholder={'Back'}
              editType={false} // Property I set to make this non editable or not (false = not editable, True = editable)
            />
          </View>


          <View className = "mt-7">
            <InputField
              title='UPLOAD YOUR RESUME'
              placeholder={'Upload Here'}
              editType={false} // Property I set to make this non editable or not (false = not editable, True = editable)
            />
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
              options={skill}
              placeholder="Select a Skill"
              onSelect={handleSelect}
            />
            <Dropdown
              options={skill}
              placeholder="Select a Skill"
              onSelect={handleSelect}
            />
            <Dropdown
              options={skill}
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