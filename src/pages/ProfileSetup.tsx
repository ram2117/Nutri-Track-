
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to set up your profile');
      return;
    }

    // Validate inputs
    const { name, age, height, weight, gender } = formData;
    if (!name || !age || !height || !weight || !gender) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          name,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          gender
        });

      if (error) throw error;

      toast.success('Profile setup complete!');
      navigate('/');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to set up profile');
    }
  };

  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-muted-foreground">
          Help us personalize your nutrition tracking
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label htmlFor="age">Age</Label>
          <Input 
            id="age"
            name="age"
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={handleInputChange}
            min={10}
            max={120}
          />
        </div>
        
        <div>
          <Label htmlFor="height">Height (cm)</Label>
          <Input 
            id="height"
            name="height"
            type="number"
            placeholder="Enter your height in centimeters"
            value={formData.height}
            onChange={handleInputChange}
            min={50}
            max={250}
          />
        </div>
        
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input 
            id="weight"
            name="weight"
            type="number"
            placeholder="Enter your weight in kilograms"
            value={formData.weight}
            onChange={handleInputChange}
            min={20}
            max={300}
          />
        </div>
        
        <div>
          <Label>Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={handleGenderChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="w-full">
          Complete Profile
        </Button>
      </form>
    </div>
  );
};

export default ProfileSetup;
