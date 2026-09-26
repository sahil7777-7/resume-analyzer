from flask import Flask, render_template, request, jsonify
from Resume import analyze_resume

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

    pdf.save(pdf.filename)

    analyze_resume(pdf.filename, text)

    return jsonify({
        "message": "PDF successfully received",
        "filename": pdf.filename,
        
        
    })


if __name__ == "__main__":
    app.run(debug=True)