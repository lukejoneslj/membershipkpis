# Quick Start Guide

## Starting the Dashboard

1. **Open Terminal** and navigate to the project:
   ```bash
   cd /Users/lukejoneslwj/Downloads/membership/membership-dashboard
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to: [http://localhost:3000](http://localhost:3000)

## Using the Dashboard

### Step 1: Upload Your CSV Files

You'll see a clean upload interface. Upload these three files:

1. **Account Data**: `all accountsw.csv`
2. **Financial Data**: `updatedfinancial.csv`  
3. **Jotform Data**: `jotformemails.csv`

Click "Analyze Data" when all three files are uploaded.

### Step 2: Explore Your Metrics

The dashboard has 4 main tabs:

#### 📊 Overview Tab
- Total members count
- Active vs canceled members
- Member retention rate
- Free trial statistics
- Visual charts showing member sources and retention

#### 🔄 Jotform Pipeline Tab
- Quiz engagement metrics (submissions, unique emails)
- Conversion rates (quiz → member)
- Free trial vs paid member breakdown
- Retention statistics for free trial users
- Conversion funnel visualization

#### 🎁 Free Trial Tab
- Total free promo transactions
- Unique users who used free trial
- Average daily usage
- Usage period and date range
- Active vs canceled breakdown
- Monthly trend charts

#### 💡 Insights Tab
- AI-powered analysis of your data
- Conversion rate assessment
- Free trial performance evaluation
- Retention concerns and recommendations
- Prioritized action items

## Key Metrics to Watch

### 🚨 Red Flags
- **Conversion rate < 5%**: Your quiz-to-member funnel needs work
- **Free trial cancellation > 40%**: Onboarding or value prop issues
- **Overall retention < 70%**: Member satisfaction concerns

### ✅ Good Performance
- **Conversion rate > 5%**: Healthy quiz funnel
- **Free trial cancellation < 30%**: Good trial experience
- **Overall retention > 70%**: Strong member satisfaction

## Understanding the Pipeline

```
Jotform Quiz Takers (17,406 people)
    ↓ 4.2% conversion
Members from Quiz (738 people)
    ↓ 29.4% use free trial
Free Trial Users (217 people)
    ↓ 43.3% cancel
Still Active (123 people)
```

## Tips for Best Results

1. **Upload fresh data regularly** to track trends over time
2. **Focus on the Insights tab** for actionable recommendations
3. **Compare monthly trends** in the Free Trial tab
4. **Share the dashboard** with your team for alignment

## Troubleshooting

### Files Won't Upload
- Ensure files are in CSV format
- Check that file names match expected format
- Verify files aren't corrupted

### Data Looks Wrong
- Confirm you uploaded the correct files
- Check that CSV headers match expected format
- Re-upload files and try again

### Performance Issues
- Close unnecessary browser tabs
- Try a different browser (Chrome recommended)
- Ensure you have stable internet connection

## Next Steps

After reviewing your dashboard:

1. **Document your baseline metrics** from the Overview tab
2. **Identify top 3 improvement areas** from the Insights tab
3. **Set goals** for conversion and retention rates
4. **Re-upload data weekly** to track progress
5. **Adjust your marketing strategy** based on insights

## Need Help?

- Check the main README.md for technical details
- Review the Insights tab for specific recommendations
- Contact support if you encounter issues

---

**Pro Tip**: Bookmark the dashboard URL and keep your CSV files updated in a designated folder for easy access!

