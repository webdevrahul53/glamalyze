

export const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setValue: any) => {
    let value = e.target.value;
    const prefix = "+"; // or make this dynamic

    // Always ensure it starts with the prefix
    if (!value.startsWith(prefix)) {
      value = prefix + value.replace(/^\+?/, "");
    }

    // Allow only digits after prefix
    value = prefix + value.slice(prefix.length).replace(/\D/g, "");

    setValue("phonenumber", value);
  }


  
export const handlePhoneNumberChange91 = (e: React.ChangeEvent<HTMLInputElement>, setValue: any) => {
    let value = e.target.value;
    
    // Always ensure it starts with +91
    if (!value.startsWith("+91")) {
      value = "+91" + value.replace(/^\+?91?/, "");
    }

    // Allow only digits after +91
    value = "+91" + value.slice(3).replace(/\D/g, "");

    setValue("phonenumber", value);
}
