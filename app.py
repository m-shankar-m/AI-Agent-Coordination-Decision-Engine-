import gradio as gr
from backend.server import app

# Create a dummy Gradio app to satisfy Hugging Face's Gradio SDK requirement
demo = gr.Blocks()
with demo:
    gr.Markdown("# Banking AI Engine Backend")
    gr.Markdown("The FastAPI backend is running successfully. API is available at `/api/v1/...`")

# Mount the Gradio app onto our FastAPI app so Hugging Face thinks it's a Gradio space
app = gr.mount_gradio_app(app, demo, path="/")
