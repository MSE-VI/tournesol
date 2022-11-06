import matplotlib.pyplot as plt
import pandas as pd
import plotly.graph_objects as go
import seaborn as sns
import streamlit as st

import time
from utils import CRITERIA, CRITERI_EXT, MSG_NO_DATA, TCOLOR, api_get_tournesol_scores, api_get_video_recommendation_sample

st.title("User graph")

col_videos, col_graph = st.columns([5, 9])

# Video column (left)

col_videos.header("Actions")

video_input = col_videos.text_input("Add a video")
col_videos.button("Add")

col_videos.header("Videos")
recommended_videos = api_get_video_recommendation_sample()
for v in recommended_videos.values:
    # metadata is 5th item in a video, so v[4]
    name = v[4].get('name')
    video_id = v[4].get('video_id')
    col_videos.image(f'https://api.tournesol.app/preview/entities/yt:{video_id}')
    col_videos.write(name)


# Graph column (right)

# TODO add the graph to `col_graph`
