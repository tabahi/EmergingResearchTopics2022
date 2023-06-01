# EmergingResearchTopics2022
 Sankey diagram web preview For Emerging Research Topics during late 2022 generated using BERTtopic on semanticscholar data for 6 months. The topics extracted from BERTtopic over 6 months are then linked together to see a temporal pattern of emerging, merging, diverging or fading research topics.


[View sankey diagram here](https://tabahi.github.io/EmergingResearchTopics2022/)


[Lauch GoJS drawing](https://tabahi.github.io/EmergingResearchTopics2022/draw.html)

## Notes


1. Different node represent the following runs:
- <span style="color:#1fff22">**2022-08**</span>.
- <span style="color:#9d75c2">**2022-09**</span>.
- <span style="color:#6699ff">**2022-10**</span>.
- <span style="color:#ffcc66">**2022-11**</span>.
- <span style="color:#ff6699">**2022-12**</span>.
- <span style="color:#00ffff">**2023-01**</span>.





2. The onward links coming out of the nodes are the same color as the topic nodes. The last run <span style="color:#00ffff">**2023-01**</span> is aqua color has no onward links that's why only the nodes are shown.

3. The width of a link line represents the **weight** of the next run's topic (whereas color is the same as the previous node).


4. The location of topic nodes along the horizontal axis **does not** represent time period. If a topic is present in all the runs, then it will start from <span style="color:#1fff22">**2022-08**</span> on the left most side and go right till <span style="color:#00ffff">**2023-01**</span>.

5. However, if a topic emerges in later run, let's say in <span style="color:#9d75c2">**2023-09**</span> then the left most node for that topic will be purple representing a start in <span style="color:#9d75c2">**2023-09**</span>.

6. Similarly, a topic having a link for only two or three runs/colors means it's corresponding topic was absent in the other runs.

7. At the botton of the diagram, there are some standalone topics without any links. They represents outliers. Our current algorithm doesn't link topics that are absent in runs in-between (i.e., it doesn't link 2022-08 to 2022-10, if it's missing in 09).

8. The outlier topics can be used to debug the issues with BERTtopic. For example, in the topic labelled 202301,313_coal_combustion_gas_gangue has no link with the previous month. Given the popularity of this topic, it's unlikely.

9. Some of the outlier topics for the last run (aqua color) could be newly emerging topics. For example: 202301,405_mirna_microrna_mir_21.

10. When a topic's width increases compared to it's tributaries, that shows an increasing weight of that topic.

