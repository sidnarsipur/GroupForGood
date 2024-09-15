![roup4Good](https://github.com/user-attachments/assets/c87988a0-ceae-4fe7-b1fc-1b23dc944f80)

**Made for HackMIT 2024**

Find shared interests among communities to create a larger impact on charitable giving.

Families, sororities, clubs, and other groups often want to donate together for a good cause but usually end up supporting one chosen by only a few members. What if we could securely analyze your interests, find common ground among a larger group, and magically match you with a charity that resonates with everyone?

Group4Good safely accesses your purchase data to identify transactions relevant to non-profit causes and anonymously records your recurring preferences within a larger group. You can create groups, share a unique code with others to join, and then pool and analyze these collective preferences. The results are matched with non-profits that align closely with what matters to you.

# How we built it

Using Capital One's Nessie API endpoints, we generated mock financial data to test our product on. For our non-profit data, we utilized a publicly available dataset of 
Massachusetts-based charities, which included their names, mission statements, and locations. 

We then employed InterSystem's IRIS Vector Search to create embeddings from each charity’s mission statement and stored these embeddings in our Firestore database. 

Once logged in, user have the option to either join an existing group or create a new one. When a group is ready to look for a charity to donate to, our Flask-based Python backend identifies the most relevant transactions for each group member. It then sends only the text embeddings of these transaction descriptions to the database, ensuring privacy. Using K-Means clustering on the generated vectors, we identify the most common transaction vector within the group. 

We then query our IRIS Vector database to find the most relevant nonprofits then returning these nonprofits to the group.
