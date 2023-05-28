import openai
from flask import Flask, request

app = Flask(__name__)

openai.api_key = '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'  # Replace with your actual OpenAI API key

@app.route('/', methods=['POST'])
def generate_response():
    data = request.get_json()
    prompt = data.get('prompt')

    # Call OpenAI API to generate a response
    response = openai.Completion.create(
        engine='davinci',
        prompt=prompt,
        max_tokens=50  # Adjust the length of the response as desired
    )

    # Log the generated response
    print("Generated Response:", response.choices[0].text)

    return response.choices[0].text

if __name__ == '__main__':
    app.run()