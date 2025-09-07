# DataPipe Troubleshooting Guide

## Issue: "MISSING_PARAMETER" Error

### Problem
When testing the OSF DataPipe API endpoint with experiment ID `xMeT3pzdPmF9`, the server returns:
```json
{"error":"MISSING_PARAMETER","message":"One or more required parameters are missing."}
```

### What We've Tested

#### ✅ Data Format Validation
- All basic required parameters are present: `action`, `experiment_id`, `session_id`, `filename`, `data_string`
- Data format matches jsPsych standards with proper CSV structure
- Parameter names and values are correctly formatted

#### ✅ Additional Parameters Tested
- `completion_code` - Often required for data integrity
- `condition_assignment` - For experimental conditions
- `user_agent` - Browser information
- `browser_details` - System information
- `consent` - Consent flags

#### ❌ Still Getting MISSING_PARAMETER Error
Despite testing multiple parameter combinations, the error persists.

### Most Likely Causes

1. **Experiment Not Registered**: The experiment ID `xMeT3pzdPmF9` may not be properly registered in the OSF DataPipe system
2. **OSF Project Configuration**: The associated OSF project may not have DataPipe properly enabled or configured
3. **Authentication Required**: The DataPipe endpoint may require authentication tokens or credentials that aren't being provided
4. **Service Changes**: OSF DataPipe may have updated their API requirements since the experiment was configured

### Recommended Solutions

#### 1. Verify Experiment Registration
- Go to [pipe.jspsych.org](https://pipe.jspsych.org)
- Log in with your OSF credentials
- Check if experiment ID `xMeT3pzdPmF9` is listed and active
- Verify the experiment configuration matches your data format

#### 2. Check OSF Project Settings
- Access your OSF project
- Ensure DataPipe component is added and configured
- Verify experiment ID matches exactly
- Check permissions and sharing settings

#### 3. Test with Official jsPsych Plugin
Instead of custom API calls, use the official jsPsych DataPipe plugin:
```javascript
const datapipe_trial = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "xMeT3pzdPmF9",
    filename: "data.csv",
    data_string: function() {
        return jsPsych.data.get().csv();
    }
};
```

#### 4. Contact OSF Support
If the above steps don't resolve the issue:
- Contact OSF DataPipe support at [osf.io/support](https://osf.io/support)
- Include the experiment ID and error details
- Ask for verification of experiment registration and configuration

#### 5. Alternative Data Collection
While troubleshooting DataPipe:
- Use the CSV download fallback already implemented in the experiment
- Set up GitHub Actions workflow for automated data collection
- Consider other data collection services (Qualtrics, custom server, etc.)

### Working Test Commands

#### Local Data Format Validation
Use the improved `test_datapipe.html` file which now includes:
- ✅ Local data format validation
- ✅ Multiple parameter combination testing  
- ✅ Detailed error reporting
- ✅ curl command generation

#### Manual API Testing
```bash
# Basic test (still fails with MISSING_PARAMETER)
curl -X POST https://pipe.jspsych.org/api/data/ \
-H "Content-Type: application/json" \
-d '{
  "action": "save",
  "experiment_id": "xMeT3pzdPmF9",
  "session_id": "test_session",
  "filename": "test_data.csv",
  "data_string": "trial_type,trial_index\n\"test\",0"
}'

# With completion code (still fails)
curl -X POST https://pipe.jspsych.org/api/data/ \
-H "Content-Type: application/json" \
-d '{
  "action": "save",
  "experiment_id": "xMeT3pzdPmF9", 
  "session_id": "test_session",
  "filename": "test_data.csv",
  "data_string": "trial_type,trial_index\n\"test\",0",
  "completion_code": "TEST123"
}'
```

### Next Steps

1. **Immediate**: Use the local data format validator to ensure your data structure is correct
2. **Short-term**: Verify experiment registration at pipe.jspsych.org
3. **If needed**: Contact OSF support for assistance
4. **Fallback**: Use CSV download functionality which is working correctly

The issue is likely not with the data format but with the experiment registration or OSF project configuration.