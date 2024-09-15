import React, { useState } from 'react';

const findCharity = async (groupNames) => {
    try {
        console.log("Group names are for findchairty:", groupNames);
        const response = await fetch('http://127.0.0.1:4000/api/getMatchingNonprofits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupNames), // Make sure groupNames is in the expected format
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data; // Return the result here

    } catch (e) {
        console.error("Error finding charity: ", e);
        throw e; // Re-throw to allow calling functions to handle the error
    }
};

export default findCharity;
