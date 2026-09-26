import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

from Resume1 import analyze_resume

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/analyze', methods=['POST'])
def analyze():

    pdf = request.files.get('resume')
    text = request.form.get('text')

    if not pdf:
        return jsonify({
            "error": "Resume PDF nahi mili"
        }), 400

    print("PDF:", pdf.filename)
    print("TEXT:", text)

    filename = os.path.join(app.root_path, "uploaded_resume.pdf")
    pdf.save(filename)

    try:
        result = analyze_resume(filename, text)
        return result
    except Exception as error:
        return str(error), 500


if __name__ == "__main__":
    app.run(debug=True)