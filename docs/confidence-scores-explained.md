# Understanding Confidence Scores in LacrosseLens

## What is a Confidence Score?

The confidence score is a percentage (0-100%) that represents how certain the Gemini AI model is about its analysis. You'll see these scores throughout the app on:

- Player evaluations
- Face-off analyses 
- Transition analyses
- Key moments
- Overall video analysis

## How Confidence Scores are Determined

### 1. **Video Quality Factors**
The AI adjusts confidence based on:
- **Video resolution** - HD videos get higher confidence
- **Camera angle** - Clear, stable shots increase confidence
- **Lighting conditions** - Well-lit footage allows better analysis
- **Camera distance** - Close-up views of plays boost confidence

### 2. **Observable Details**
Higher confidence when the AI can clearly see:
- **Jersey numbers** - Visible numbers increase player evaluation confidence
- **Ball location** - Clear ball tracking improves play analysis
- **Player movements** - Unobstructed views of technique
- **Face-off outcomes** - Clear possession after face-offs

### 3. **Analysis Type**
Different analyses have typical confidence ranges:
- **Player Evaluations**: 75-95% (depends on visibility of technique)
- **Face-offs**: 70-90% (depends on camera angle at X)
- **Transitions**: 65-85% (requires tracking multiple players)
- **Key Moments**: 80-95% (usually focused action)

## What Different Confidence Levels Mean

### 90-100% - Very High Confidence
- Crystal clear video quality
- Perfect camera angle for the play
- All players and ball clearly visible
- Jersey numbers easily readable
- Technique details fully observable

### 75-89% - High Confidence
- Good video quality
- Most details clearly visible
- Some players may be partially obscured
- Main action is clear
- Minor uncertainty about specific details

### 60-74% - Moderate Confidence
- Average video quality
- Some important details obscured
- Camera angle not ideal
- Players at distance
- Some interpretation required

### Below 60% - Low Confidence (Filtered Out)
- Poor video quality or lighting
- Key details obscured
- Camera too far or bad angle
- Fast action hard to track
- Significant interpretation needed

**Important**: Analyses with confidence scores below 60% are automatically filtered out and not shown to users to ensure only reliable insights are presented.

## How LacrosseLens Uses Confidence Scores

1. **Filtering** - You can filter analyses by confidence level
2. **Prioritization** - Higher confidence analyses shown first
3. **Coaching Decisions** - Use high-confidence clips for teaching
4. **Player Development** - Track improvement with consistent high-confidence evaluations

## Tips for Higher Confidence Scores

To get the best analysis confidence:
1. Upload HD quality videos (1080p or higher)
2. Ensure good lighting conditions
3. Use stable camera work (tripod recommended)
4. Position camera for clear view of play
5. Ensure jersey numbers are visible
6. Avoid excessive zooming during plays

## Important Notes

- Confidence scores are **per analysis item**, not per video
- A video can have both high and low confidence analyses
- Weather conditions (rain, fog) will lower confidence
- Night games may have lower confidence than day games
- Multiple camera angles in highlights can vary confidence

The confidence score helps you understand how much weight to give each piece of analysis. Higher confidence means the AI had excellent visibility and could analyze technique with precision. Lower confidence suggests the analysis is based on partial information but may still provide valuable insights.