# Gender Classification API

A RESTful API service that classifies names by gender using the Genderize.io external API. This server provides gender predictions with confidence metrics for submitted names.

## Features

- **Gender Classification**: Predicts gender based on name input
- **Confidence Scoring**: Returns probability and confidence indicators
- **Sample Size Tracking**: Provides the sample size used for predictions
- **CORS Support**: Fully configured for cross-origin requests
- **Error Handling**: Comprehensive error responses with meaningful messages
- **Timestamp Tracking**: Records when each prediction was processed

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MhideTech/Data-Processing-Assessment
cd Data-Processing-Assessment
```

2. Install dependencies:

```bash
npm install
```

3. Ensure you have Express and type definitions installed:

```bash
npm install express
```

## Configuration

The API runs on **port 3000** by default. No environment variables are required for basic setup.

## Usage

### Starting the Server

```bash
npm start
```

or

```bash
node index.js
```

You should see the output:

```
Server is running on port 3000
```

### API Endpoints

#### GET `/api/classify`

Classifies a name by gender.

**Parameters:**
- `name` (required, string): The name to classify

**Query Example:**

```
GET /api/classify?name=john
```

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.95,
    "is_confident": true,
    "sample_size": 5000,
    "processed_at": "2024-01-15T10:30:45.123Z"
  }
}
```

**Error Response (400) - Missing Parameter:**

```json
{
  "status": "error",
  "message": "Missing or empty name parameter"
}
```

**Error Response (422) - Invalid Type:**

```json
{
  "status": "error",
  "message": "name is not a string"
}
```

**Error Response (422) - No Prediction Available:**

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

**Error Response (500) - Server Error:**

```json
{
  "status": "error",
  "message": "Upstream or server failure"
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| status | string | Either "success" or "error" |
| name | string | The input name that was classified |
| gender | string | Predicted gender ("male", "female", or null) |
| probability | number | Confidence probability (0-1) |
| is_confident | boolean | True if probability ≥ 0.7 AND sample_size ≥ 100 |
| sample_size | number | Number of samples used for prediction |
| processed_at | string | ISO 8601 timestamp of when the prediction was made |

## Confidence Scoring

The `is_confident` field indicates high confidence predictions based on:
- **Probability ≥ 0.7**: At least 70% confidence in the gender prediction
- **Sample Size ≥ 100**: At least 100 data samples used in the calculation

Both conditions must be met for `is_confident` to be `true`.

## CORS Configuration

The API includes middleware that handles CORS requests:
- **Allowed Origins**: All (`*`)
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Origin, X-Requested-With, Content-Type, Accept

## Technologies Used

- **Express.js**: Web framework for Node.js
- **Genderize.io API**: External API for gender prediction
- **Node.js Fetch API**: For HTTP requests to external services

## External Dependencies

This API relies on the **Genderize.io** service (`https://api.genderize.io`). Ensure your server has internet connectivity to this endpoint.

## Error Handling

The API implements comprehensive error handling:

1. **Input Validation**: Checks for missing or non-string parameters
2. **API Failures**: Handles failures from the Genderize.io service
3. **Network Errors**: Catches upstream failures and server errors
4. **No Data**: Responds appropriately when no prediction is available

## Example Usage

### Using cURL

```bash
curl "http://localhost:3000/api/classify?name=alice"
```

## Project Structure

```
.
├── index.js           # Main application file
├── package.json       # Project dependencies
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in the repository or contact the project maintainers.

## Changelog

### Version 1.0.0
- Initial release
- Gender classification endpoint
- CORS support
- Error handling and validation