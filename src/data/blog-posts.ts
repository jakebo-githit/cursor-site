// 博客文章元数据配置
// 每次添加新文章时，需要在这里添加对应的元数据
// 同时在 src/blog-posts/ 目录下创建对应的 .md 文件

export interface BlogPost {
  id: string;           // 文章唯一标识（对应 .md 文件名）
  title: string;        // 中文标题
  titleEn: string;      // 英文标题
  excerpt: string;      // 中文摘要
  excerptEn: string;    // 英文摘要
  seoTitle?: string;    // SEO标题（可选）
  seoDescription?: string; // SEO描述（可选）
  date: string;         // 发布日期 (YYYY-MM-DD)
  category: string;     // 中文分类
  categoryEn: string;   // 英文分类
  imageUrl?: string;    // 图片URL（可选）
  author?: string;      // 作者（可选）
}

export const blogPosts: BlogPost[] = [
  {
    id: '20260415-胆囊结石的非手术治疗方法除了切除还有哪些选择-luwfts',
    title: '胆囊结石的非手术治疗方法：除了切除还有哪些选择？',
    titleEn: 'Non-Surgical Treatment Options for Gallstones: Alternatives to Gallbladder Removal',
    excerpt: '患有胆囊结石必须切除胆囊吗？本文由肝胆外科专家为您详解熊去氧胆酸溶石、体外碎石、中医干预等非手术治疗的适应症与局限性。',
    excerptEn: 'Do gallstones always require gallbladder removal? This guide by a senior hepatobiliary surgeon explores oral dissolution therapy, ESWL, and other non-surgical options, along with their limitations.',
    seoTitle: '胆囊结石非手术治疗：胆囊结石的非手术治疗方法全解析：溶石、碎石与药物干预',
    seoDescription: '胆囊结石非手术治疗，了解胆囊结石的非手术治疗方法。详解口服溶石药物、体外冲击波碎石等手段的适应症、优缺点及复发风险，帮助您做出明智的保胆治疗选择。',
    date: '2026-04-15',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260415-胆囊结石的非手术治疗方法除了切除还有哪些选择-luwfts.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260414-胆囊结石能吃水果吗肝胆外科医生的饮食建议-duhzvt',
    title: '胆囊结石能吃水果吗？肝胆外科医生的饮食建议',
    titleEn: 'Can You Eat Fruit with Gallstones? A Surgeon\\'s Dietary Guide',
    excerpt: '胆囊结石患者是可以吃水果的，但需注意种类和食用方式。本文由资深肝胆外科医生为您详细解答哪些水果适合，哪些应少吃。',
    excerptEn: 'Yes, patients with gallstones can eat fruit, but the type and portion matter. This guide by a senior hepatobiliary surgeon explains which fruits are safe and which to limit.',
    seoTitle: '胆囊结石能吃水果吗？附胆囊结石患者水果红黑榜',
    seoDescription: '胆囊结石能吃水果吗，确诊胆囊结石后还能吃水果吗？资深肝胆外科医生为您解答。了解胆囊结石患者适宜的低脂高纤维水果，以及需要避免的诱发胆绞痛的饮食陷阱。',
    date: '2026-04-14',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260414-胆囊结石能吃水果吗肝胆外科医生的饮食建议-duhzvt.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260410-保胆手术后如何复查与长期管理肝胆外科专家给出建议-wfodte',
    title: '保胆手术后如何复查与长期管理？肝胆外科专家给出建议',
    titleEn: "Post-Cholecystolithotomy Follow-up and Long-Term Management: A Surgeon's Guide",
    excerpt: '保胆取石术后并非一劳永逸，科学的复查与生活习惯调整是预防结石复发的关键。本文详细解析保胆术后的复查时间表、饮食管理及用药指导。',
    excerptEn: 'Cholecystolithotomy is not a one-time cure. Scientific follow-ups and lifestyle adjustments are crucial to preventing gallstone recurrence. This guide details the post-op follow-up schedule, diet, and medication.',
    seoTitle: '保胆手术后复查与长期管理指南 - 肝胆外科专家详解',
    seoDescription: '保胆手术后复查，了解保胆手术后如何科学复查与长期管理。资深肝胆外科医生分享保胆取石术后复查时间表、饮食调整及预防结石复发的关键建议。',
    date: '2026-04-10',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260410-保胆手术后如何复查与长期管理肝胆外科专家给出建议-wfodte.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260409-胆囊切除术后腹泻与消化不良的应对策略-nxhxqj',
    title: '胆囊切除术后腹泻与消化不良的应对策略',
    titleEn: 'Managing Diarrhea and Indigestion After Cholecystectomy',
    excerpt: '胆囊切除术后出现腹泻和消化不良是常见并发症，约5%-15%的患者会受到影响。本文从肝胆外科专家视角，详细解析术后消化问题的成因，并提供科学的饮食调整和药物治疗建议。',
    excerptEn: 'Post-cholecystectomy diarrhea and indigestion affect approximately 5-15% of patients. This article provides expert insights into causes, dietary modifications, and pharmacological management strategies.',
    seoTitle: '胆囊切除术后腹泻消化不良：胆囊切除术后腹泻与消化不良的全面应对指南 | 肝胆外科专家建议',
    seoDescription: '胆囊切除术后腹泻消化不良，胆囊切除术后出现腹泻和消化不良？了解胆汁酸性腹泻的成因，掌握科学的饮食调整策略和药物治疗方法，帮助您顺利度过术后恢复期。',
    date: '2026-04-09',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260409-胆囊切除术后腹泻与消化不良的应对策略-nxhxqj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260406-胆囊炎发作可以吃止痛药吗肝胆外科医生的详细解答-vkpzzz',
    title: '胆囊炎发作可以吃止痛药吗？肝胆外科医生的详细解答',
    titleEn: 'Can You Take Painkillers During a Gallbladder Attack? A Hepatobiliary Surgeon\'s Guide',
    excerpt: '胆囊炎发作时能否服用止痛药是患者常见疑问。本文从肝胆外科专业角度，详细解析胆囊炎疼痛管理、止痛药使用的注意事项及何时需要紧急就医。',
    excerptEn: 'Whether to take painkillers during a gallbladder attack is a common question. This article provides professional insights on pain management, precautions for painkiller use, and when to seek emergency care.',
    seoTitle: '胆囊炎止痛药：胆囊炎发作可以吃止痛药吗？专业医生解答与注意事项',
    seoDescription: '胆囊炎止痛药，胆囊炎发作疼痛难忍时能否吃止痛药？本文由肝胆外科医生详解胆囊炎疼痛管理策略、止痛药选择、禁忌症及紧急就医指征，帮助您安全应对胆囊炎发作。',
    date: '2026-04-06',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260406-胆囊炎发作可以吃止痛药吗肝胆外科医生的详细解答-vkpzzz.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'gallbladder-removal-one-week-meal-plan',
    title: '胆囊切除术后一周食谱清单：科学饮食助你快速康复',
    titleEn: 'One-Week Meal Plan After Gallbladder Removal: Science-Based Nutrition for Recovery',
    excerpt: '胆囊切除术后一周内如何科学饮食？本文提供详细的每日食谱建议，包括早餐、午餐、晚餐和加餐，帮助您平稳度过术后恢复期，减少消化不适。',
    excerptEn: 'How to eat scientifically in the first week after gallbladder removal? This article provides detailed daily meal plan suggestions, including breakfast, lunch, dinner, and snacks, to help you smoothly navigate the post-surgery recovery period and minimize digestive discomfort.',
    seoTitle: '胆囊切除术后一周食谱清单：科学饮食助快速康复',
    seoDescription: '胆囊切除术后一周怎么吃？提供7天详细食谱、食物选择原则、烹饪方法建议及就医信号，助您科学恢复。',
    date: '2026-04-05',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/gallbladder-removal-meal-plan.jpg',
    author: 'Dr. Liu'
  },
  {
    id: '20260331-胆囊切除术后能喝咖啡吗科学指南与建议-krqxlr',
    title: '胆囊切除术后能喝咖啡吗？科学指南与建议',
    titleEn: 'Can You Drink Coffee After Cholecystectomy? A Scientific Guide',
    excerpt: '胆囊切除术后适量饮用咖啡通常是安全的，但需注意时机与个体差异。本文详解术后喝咖啡的注意事项、潜在益处及可能的消化不适，助您科学恢复。',
    excerptEn: 'Moderate coffee consumption is generally safe after gallbladder removal, but timing and individual tolerance matter. This guide covers precautions, potential benefits, and digestive considerations for post-cholecystectomy patients.',
    seoTitle: '胆囊切除术后喝咖啡：胆囊切除术后能喝咖啡吗？权威解答与饮用建议 | 肝胆外科专家',
    seoDescription: '胆囊切除术后喝咖啡，胆囊切除术后能否喝咖啡？本文由肝胆外科专家撰写，详解术后喝咖啡的安全性、最佳时机、注意事项及替代选择，助您科学恢复。',
    date: '2026-03-31',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260331-胆囊切除术后能喝咖啡吗科学指南与建议-krqxlr.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260331-胆囊结石小于1cm怎么治疗专业肝胆外科医生详解-eajcaq',
    title: '胆囊结石小于1cm怎么治疗？专业肝胆外科医生详解',
    titleEn: 'How to Treat Gallbladder Stones Smaller Than 1cm: A Specialist\'s Guide',
    excerpt: '小于1cm的胆囊结石并不一定需要立即手术。本文从专业肝胆外科角度，详细解析小结石的治疗策略、随访方案及手术指征，帮助您做出明智的医疗决策。',
    excerptEn: 'Gallstones smaller than 1cm don\'t always require immediate surgery. This article provides a specialist perspective on treatment strategies, follow-up protocols, and surgical indications for small gallstones.',
    seoTitle: '胆囊结石小于1cm治疗：胆囊结石小于1cm怎么治疗？手术还是观察？| 肝胆外科专家解读',
    seoDescription: '胆囊结石小于1cm治疗，胆囊结石小于1cm如何治疗？是否需要手术？本文由肝胆外科专家详细解答小结石的治疗方案、随访策略及手术时机，助您科学决策。',
    date: '2026-03-31',
    category: '胆囊结石',
    categoryEn: 'Gallbladder Stones',
    imageUrl: '/images/blog/blog-20260331-胆囊结石小于1cm怎么治疗专业肝胆外科医生详解-eajcaq.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260331-胆囊切除后如何应对脂肪消化问题肝胆外科医生的实用指南-vswhan',
    title: '胆囊切除后如何应对脂肪消化问题：肝胆外科医生的实用指南',
    titleEn: 'Managing Fat Digestion After Cholecystectomy: A Practical Guide from a Hepatobiliary Surgeon',
    excerpt: '胆囊切除术后出现脂肪消化不良是常见问题。本文从肝胆外科专业角度解析胆汁持续引流对脂肪消化的影响，提供科学的饮食调整策略和逐步恢复方法，帮助患者重获正常消化功能。',
    excerptEn: 'Fat digestion issues are common after gallbladder removal. This article explains how continuous bile flow affects fat digestion and provides evidence-based dietary strategies to help patients regain normal digestive function.',
    seoTitle: '胆囊切除后脂肪消化问题全解析 | 肝胆外科专家指南',
    seoDescription: '胆囊切除后脂肪消化，胆囊切除后吃油腻食物就腹泻？肝胆外科医生详解术后脂肪消化问题的成因、症状缓解方法和科学饮食策略，助您平稳度过恢复期。',
    date: '2026-03-31',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260331-胆囊切除后如何应对脂肪消化问题肝胆外科医生的实用指南-vswhan.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260331-胆囊结石的成因与高危因素深入了解胆石症的发生机制-jmjgaf',
    title: '胆囊结石的成因与高危因素：深入了解胆石症的发生机制',
    titleEn: 'Causes and Risk Factors of Gallstones: A Comprehensive Guide to Cholelithiasis',
    excerpt: '胆囊结石是常见的消化系统疾病，了解其成因和高危因素有助于预防和早期干预。本文从胆固醇代谢、胆汁淤积、生活方式等多角度解析胆结石形成机制，并提供专业的预防建议。',
    excerptEn: 'Gallstones are a common digestive system disorder. Understanding their causes and risk factors is essential for prevention and early intervention. This article explores gallstone formation mechanisms from multiple perspectives, including cholesterol metabolism, bile stasis, and lifestyle factors.',
    seoTitle: '胆囊结石成因与高危因素 | 肝胆外科专家深度解析',
    seoDescription: '胆囊结石成因，详解胆囊结石的形成原因与高危因素，包括胆固醇代谢异常、胆汁淤积、肥胖、快速减肥等。由肝胆外科专家撰写，提供科学预防建议。',
    date: '2026-03-31',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260331-胆囊结石的成因与高危因素深入了解胆石症的发生机制-jmjgaf.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260329-胆囊切除术后能吃海鲜吗肝胆外科医生的详细解答-belypj',
    title: '胆囊切除术后能吃海鲜吗？肝胆外科医生的详细解答',
    titleEn: 'Can You Eat Seafood After Cholecystectomy? A Hepatobiliary Surgeon\'s Guide',
    excerpt: '胆囊切除术后可以适量吃海鲜，但需注意时机和方式。术后早期应避免，恢复期可从低脂鱼类开始，逐步增加种类。本文详解术后海鲜摄入的注意事项。',
    excerptEn: 'Patients can eat seafood in moderation after cholecystectomy, but timing and preparation matter. Start with low-fat fish during recovery and gradually expand variety. This guide explains key considerations for post-surgical seafood consumption.',
    seoTitle: '胆囊切除术后吃海鲜：胆囊切除术后能吃海鲜吗？术后饮食指南与注意事项',
    seoDescription: '胆囊切除术后吃海鲜，胆囊切除术后能否吃海鲜？肝胆外科医生详解术后海鲜摄入时机、种类选择及注意事项，帮助患者科学恢复。',
    date: '2026-03-29',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260329-胆囊切除术后能吃海鲜吗肝胆外科医生的详细解答-belypj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260328-保胆手术后的复查与长期管理完整指南-hdmxex',
    title: '保胆手术后的复查与长期管理：完整指南',
    titleEn: 'Post-Gallbladder-Preserving Surgery Follow-up and Long-term Management: A Complete Guide',
    excerpt: '保胆手术后并非一劳永逸，科学的复查计划与长期生活管理是预防结石复发的关键。本文详解术后复查时间节点、检查项目及日常注意事项，助您守护胆囊健康。',
    excerptEn: 'Gallbladder-preserving surgery is not a one-time solution. Scientific follow-up schedules and long-term lifestyle management are crucial for preventing stone recurrence. This article details postoperative follow-up timelines, examination items, and daily precautions to help you maintain gallbladder health.',
    seoTitle: '保胆手术后复查与长期管理指南 | 肝胆外科专家建议',
    seoDescription: '保胆手术后复查，详解保胆手术后的标准复查流程、必做检查项目及时间安排，提供专业的长期管理建议，有效降低胆囊结石复发风险，守护您的胆囊健康。',
    date: '2026-03-28',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260328-保胆手术后的复查与长期管理完整指南-hdmxex.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260327-胆固醇性胆结石患者饮食指南吃什么怎么吃-jznxvi',
    title: '胆固醇性胆结石患者饮食指南：吃什么、怎么吃',
    titleEn: 'Dietary Guide for Cholesterol Gallstones: What to Eat and How to Eat',
    excerpt: '胆固醇性胆结石的形成与饮食习惯密切相关。本文从肝胆外科医生的专业角度，详细解析如何通过调整饮食结构——如控制脂肪摄入、增加膳食纤维——来控制结石生长并预防急性发作。',
    excerptEn: 'The formation of cholesterol gallstones is closely linked to dietary habits. From the perspective of a hepatobiliary surgeon, this article details how to control stone growth and prevent acute attacks by adjusting dietary structure, such as controlling fat intake and increasing dietary fiber.',
    seoTitle: '胆固醇性胆结石饮食：胆固醇性胆结石怎么吃？肝胆外科医生的详细饮食建议',
    seoDescription: '胆固醇性胆结石饮食，患了胆固醇性胆结石不知道该怎么吃？本文为您提供专业的饮食指导，包括低脂饮食原则、推荐食物与禁忌食物清单，帮助您科学管理胆囊健康。',
    date: '2026-03-27',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260327-胆固醇性胆结石患者饮食指南吃什么怎么吃-jznxvi.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj',
    title: '胆囊炎并发症的识别与预防：守护胆囊健康的关键指南',
    titleEn: 'Recognition and Prevention of Cholecystitis Complications: A Key Guide to Protecting Gallbladder Health',
    excerpt: '胆囊炎若不及时治疗，可能引发胆囊穿孔、胆管炎、胰腺炎等严重并发症。本文详解胆囊炎并发症的早期识别方法与科学预防策略，帮助患者及时就医，避免病情恶化。',
    excerptEn: 'If left untreated, cholecystitis can lead to serious complications such as gallbladder perforation, cholangitis, and pancreatitis. This article explains early recognition methods and scientific prevention strategies to help patients seek timely medical care and avoid disease progression.',
    seoTitle: '胆囊炎并发症的识别与预防 | 肝胆外科专家详解',
    seoDescription: '了解胆囊炎并发症的识别与预防方法，包括胆囊穿孔、胆管炎、胰腺炎等。肝胆外科专家为您详解症状、风险因素及科学预防策略。',
    date: '2026-03-26',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260325-胆囊切除术后一周食谱清单肝胆外科医生的饮食分级指南-m5dqdl',
    title: '胆囊切除术后一周食谱清单：肝胆外科医生的饮食分级指南',
    titleEn: 'One-Week Meal Plan After Cholecystectomy: A Hepatobiliary Surgeon\'s Dietary Guide',
    excerpt: '胆囊切除术后第一周是消化系统重建的关键期。本文提供详细的一周食谱清单，涵盖每日三餐具体搭配、食材选择原则、以及术后脂肪耐受的个体化调整策略，帮助患者平稳度过恢复期。',
    excerptEn: 'The first week after gallbladder removal is critical for digestive adaptation. This guide provides a detailed one-week meal plan, daily menu suggestions, food selection principles, and personalized fat tolerance strategies for smooth recovery.',
    seoTitle: '胆囊切除术后一周食谱清单 | 肝胆外科医生亲测饮食指南',
    seoDescription: '胆囊切除术后一周食谱，胆囊切除术后第一周吃什么？本文由肝胆外科医生撰写，提供详细的一周食谱清单、食材分级选择、风险信号识别，帮助您科学度过术后恢复期。',
    date: '2026-03-25',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260325-胆囊切除术后一周食谱清单肝胆外科医生的饮食分级指南-m5dqdl.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260325-胆囊炎发作的早期症状有哪些6个信号别忽视第4个最易误诊-nfjluu',
    title: '胆囊炎发作的早期症状有哪些？6个信号别忽视，第4个最易误诊',
    titleEn: 'Early Symptoms of Cholecystitis: 6 Warning Signs You Shouldn\'t Ignore',
    excerpt: '胆囊炎发作前往往有迹可循。右上腹隐痛、饭后胀气、肩背部放射痛……这些看似普通的症状可能是胆囊在「求救」。本文详解胆囊炎6大早期信号、与胃病的鉴别要点，以及什么情况需要立即就医。',
    excerptEn: 'Cholecystitis often gives warning signs before a full-blown attack. Vague right upper abdominal pain, post-meal bloating, radiating shoulder pain—these seemingly ordinary symptoms may be your gallbladder crying for help. Learn the 6 early warning signs and when to seek emergency care.',
    seoTitle: '胆囊炎发作的早期症状有哪些？6个警示信号｜肝胆外科医生详解',
    seoDescription: '胆囊炎发作的早期症状，胆囊炎早期症状包括右上腹痛、饭后胀气、右肩放射痛等，易与胃病混淆。本文由肝胆外科医生详解6大早期信号、自我判断方法和紧急就医指征。',
    date: '2026-03-25',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260323-胆囊结石与胰腺炎的关系-警惕胆源性胰腺炎的风险-wusqcu',
    title: '胆囊结石与胰腺炎的关系：警惕胆源性胰腺炎的风险',
    titleEn: 'The Relationship Between Gallstones and Pancreatitis: Understanding Biliary Pancreatitis Risk',
    excerpt: '胆囊结石是引起急性胰腺炎最常见的原因之一。当结石滑落阻塞胆胰管交汇处时，可能引发胆源性胰腺炎。本文深入解析两者关系、发病机制及防治策略。',
    excerptEn: 'Gallstones are one of the most common causes of acute pancreatitis. When stones slip and block the biliopancreatic junction, they can trigger biliary pancreatitis. This article explores their relationship, pathogenesis, and prevention strategies.',
    date: '2026-03-23',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: '刘波主任'
  },
  {
    id: '20260321-保胆取石术后护理要点加速康复的关键指南-7fvbbi',
    title: '保胆取石术后护理要点：加速康复的关键指南',
    titleEn: 'Essential Post-Operative Care After Gallbladder-Preserving Cholecystolithotomy',
    excerpt: '保胆取石术后的科学护理对预防结石复发、促进身体康复至关重要。本文从饮食管理、伤口护理、运动恢复及长期随访四个维度，为您详细解读术后护理要点。',
    excerptEn: 'Proper post-operative care after gallbladder-preserving cholecystolithotomy is crucial for preventing stone recurrence and promoting recovery. This guide covers dietary management, wound care, physical activity, and long-term follow-up strategies.',
    seoTitle: '保胆取石术后护理要点 | 肝胆外科专家指导',
    seoDescription: '详解保胆取石术后护理要点，包括饮食调整、伤口护理、运动恢复及复查随访，帮助患者科学康复，降低结石复发风险。',
    date: '2026-03-21',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  },

  {
    id: '20260320-急性胆囊炎的早期识别与紧急处理-x5w0vo',
    title: '急性胆囊炎的早期识别与紧急处理',
    titleEn: 'Early Identification and Emergency Management of Acute Cholecystitis',
    excerpt: '急性胆囊炎是一种常见的胆囊疾病，了解其早期识别与紧急处理至关重要。',
    excerptEn: 'Acute cholecystitis is a common gallbladder condition; understanding its early identification and emergency management is crucial.',
    seoTitle: '急性胆囊炎的早期识别与紧急处理',
    seoDescription: '了解急性胆囊炎的早期识别与紧急处理方法，助您快速应对。',
    date: '2026-03-20',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260319-胆囊炎反复发作的原因-folgmj',
    title: '胆囊炎反复发作的原因',
    titleEn: 'Causes of Recurrent Cholecystitis',
    excerpt: '胆囊炎反复发作可能由多种原因引起，包括胆囊结石、胆囊功能障碍和饮食习惯等。了解这些原因有助于预防和管理胆囊炎。',
    excerptEn: 'Recurrent cholecystitis can be caused by various factors, including gallstones, gallbladder dysfunction, and dietary habits. Understanding these causes can help in preventing and managing cholecystitis.',
    seoTitle: '胆囊炎反复发作的原因及预防',
    seoDescription: '了解胆囊炎反复发作的原因，包括胆囊结石、胆囊功能障碍和饮食习惯等，以及如何预防和管理胆囊炎。',
    date: '2026-03-19',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: 'AskDrLiu.com'
  },

  {
    id: '20260317-胆囊炎为何反复-w4xvs1',
    title: '胆囊炎反复发作怎么办？原因、饮食与就医时机',
    titleEn: 'Why Does Cholecystitis Keep Recurring?',
    excerpt: '胆囊炎反复发作怎么办？这篇文章从胆结石、饮食刺激、胆汁淤积和复查时机出发，讲清复发原因与应对要点。',
    excerptEn: 'Understanding the underlying causes of recurrent cholecystitis can help with effective prevention and management strategies.',
    seoTitle: '胆囊炎反复发作怎么办？原因、饮食与就医时机',
    seoDescription: '胆囊炎为什么总是反复发作？这篇文章讲清胆囊炎反复发作的原因、胆囊炎饮食怎么调、胆囊炎不能吃什么，以及什么时候必须就医。',
    date: '2026-03-17',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260317-胆囊炎为何反复-w4xvs1-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260316-胆囊结石能自己排出吗-65pvyl',
    title: '胆囊结石能自己排出吗',
    titleEn: 'Can Gallstones Pass on Their Own?',
    excerpt: '胆囊结石能否自行排出？了解风险与科学应对策略，避免盲目尝试排石疗法。',
    excerptEn: 'Can gallstones pass on their own? Learn about the risks and evidence-based approaches to avoid dangerous self-treatment attempts.',
    seoTitle: '胆囊结石能自己排出吗？肝胆外科医生的真实解答',
    seoDescription: '"喝橄榄油能排石"是真的吗？肝胆外科医生从循证角度解释胆囊结石为何几乎不能自行排出，以及拖延的真实风险。',
    date: '2026-03-16',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260316-胆囊结石能自己排出吗-65pvyl-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260315-胆囊切除后吃什么-术后饮食与营养恢复指南',
    title: '胆囊切除后吃什么？术后饮食、腹泻与营养恢复指南',
    titleEn: 'What to Eat After Gallbladder Removal: Diet, Diarrhea and Recovery',
    excerpt: '胆囊切除后吃什么、要清淡多久、腹泻怎么办？结合较新研究，讲清术后饮食与营养恢复要点。',
    excerptEn: 'A practical guide to post-cholecystectomy diet, diarrhea control, and nutrition recovery based on recent evidence.',
    seoTitle: '胆囊切除后吃什么？术后饮食与营养恢复指南',
    seoDescription: '胆囊切除后饮食怎么安排？这篇文章结合最新研究，讲清术后腹泻、清淡饮食、高脂食物风险和营养恢复重点。',
    date: '2026-03-18',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-胆囊切除后吃什么-术后饮食与营养恢复指南-regen.png',
    author: 'AskDrLiu.com'
  },


  {
    id: '20260315-胆汁酸腹泻胆囊切除后新解-y792un',
    title: '胆汁酸腹泻：胆囊切除后新解',
    titleEn: 'Bile Acid Diarrhea: Understanding Post-Cholecystectomy Issues',
    excerpt: '胆囊切除后持续性腹泻？最新研究揭示胆汁酸腹泻机制与应对策略。',
    excerptEn: 'Persistent diarrhea after gallbladder removal? Latest insights on bile acid diarrhea mechanisms and management approaches.',
    seoTitle: '胆囊切除后腹泻为什么超过3个月还不好？可能是胆汁酸腹泻',
    seoDescription: '胆囊切除后持续腹泻是胆汁酸腹泻吗？本文解析术后胆汁酸紊乱机制、易漏诊原因与饮食调整方法，帮助患者对症应对。',
    date: '2026-03-15',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-胆汁酸腹泻胆囊切除后新解-y792un-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260315-保胆标准与切胆后营养修复-kx9p3m',
    title: '保胆还是切胆？——术前筛选标准与切除后营养修复完全指南',
    titleEn: 'Preserve or Remove? Gallbladder Criteria & Post-Op Nutrition Guide',
    excerpt: '保胆取石并非人人适合，切胆后营养修复也大有学问。一文读懂术前筛选五大标准与术后三大营养问题。',
    excerptEn: 'Not everyone qualifies for gallbladder preservation. Learn the 5 key criteria for POCS candidates and the 3 major nutritional challenges after cholecystectomy.',
    seoTitle: '保胆取石适应症与胆囊切除后营养修复指南 | 刘波医生',
    seoDescription: '刘波医生详解保胆取石五大筛选标准（胆囊壁、结石大小、胆囊功能、MRCP评估），以及切除胆囊后腹泻、脂肪吸收障碍、菌群失调三大营养修复策略，含电子书推荐。',
    date: '2026-03-15',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/blog/blog-20260315-保胆标准与切胆后营养修复-kx9p3m-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260314-保胆取石术后恢复指南-9q1ynf',
    title: '保胆取石术后恢复指南',
    titleEn: 'Post-Gallbladder Preservation Stone Removal Recovery Guide',
    excerpt: '保胆取石术后一周恢复时间表，助您科学康复，避免常见误区。',
    excerptEn: 'A comprehensive one-week recovery timeline after gallbladder preservation stone removal, helping patients navigate the healing process with practical advice.',
    seoTitle: '保胆取石术后一周恢复时间表与注意事项',
    seoDescription: '详细解析保胆取石术后一周恢复过程，包括饮食、活动、疼痛管理等关键要点，帮助患者科学康复。',
    date: '2026-03-14',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260314-保胆取石术后恢复指南-9q1ynf-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260313-保胆取石适合人群与注意事项-9atae9',
    title: '保胆取石：适合人群与注意事项',
    titleEn: 'Gallbladder Preservation Surgery: Who Are Suitable Candidates',
    excerpt: '保胆取石手术并非人人适合，了解适应症是成功治疗的关键。',
    excerptEn: 'Gallbladder preservation surgery isn\'t suitable for everyone. Understanding eligibility criteria is crucial for successful treatment.',
    seoTitle: '保胆取石手术适合人群与禁忌症详解',
    seoDescription: '了解保胆取石手术的适应症、禁忌症及术后注意事项，帮助患者做出明智的治疗选择。',
    date: '2026-03-13',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260313-保胆取石适合人群与注意事项-9atae9-regen.png',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260312-胆囊炎抗生素使用指南-0q8jgm',
    title: '胆囊炎抗生素使用指南',
    titleEn: 'Guide to Antibiotic Use for Gallbladder Inflammation',
    excerpt: '合理使用抗生素是治疗胆囊炎的关键，了解何时用药、如何用药至关重要。',
    excerptEn: 'Understanding the proper use of antibiotics for gallbladder inflammation is crucial for effective treatment.',
    seoTitle: '胆囊炎抗生素治疗指南：合理用药与注意事项',
    seoDescription: '了解胆囊炎抗生素治疗的合理使用方法，包括用药时机、药物选择及注意事项，帮助患者科学应对胆囊炎。',
    date: '2026-03-12',
    category: '胆囊炎',
    categoryEn: 'Cholecystitis',
    imageUrl: '/images/blog/blog-20260312-胆囊炎抗生素使用指南-0q8jgm.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260310-饮食防胆结石-vc22gd',
    title: '饮食防胆结石：科学证据与实用建议',
    titleEn: 'Diet and Gallstones: Evidence-Based Prevention',
    excerpt: '胆结石影响全球10-15%成人，饮食调整可降低30-50%发病风险。本文解析饮食与结石形成机制，提供6项循证建议，涵盖脂肪控制、膳食纤维、规律饮食、维生素C及体重管理。',
    excerptEn: 'Gallstones affect 10-15% of adults globally. Dietary modifications can reduce risk by 30-50%. This article explores mechanisms and provides 6 evidence-based recommendations covering fat quality, fiber intake, meal regularity, vitamin C, and weight management.',
    seoTitle: '科学饮食预防胆囊结石：循证医学指南',
    seoDescription: '了解如何通过调整饮食预防胆囊结石，包括脂肪控制、膳食纤维、规律饮食、维生素C及体重管理的科学建议，附7篇参考文献。',
    date: '2026-03-10',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260310-饮食防胆结石-vc22gd.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260309-保胆手术后恢复指南-abugyi',
    title: '保胆手术后恢复指南',
    titleEn: 'Recovery Guide After Gallbladder-Preserving Surgery',
    excerpt: '保胆手术保留胆囊功能的同时去除结石，恢复周期较短但需严格术后管理。本文提供详细恢复时间表（1-3天至长期）、实用建议及工作恢复指导，附6篇参考文献。',
    excerptEn: 'Gallbladder-preserving surgery removes stones while retaining function, offering quicker recovery but requiring stringent postoperative care. This guide provides detailed recovery timeline, practical tips, and return-to-work guidance with 6 academic references.',
    seoTitle: '保胆手术后恢复全攻略：时间表与注意事项',
    seoDescription: '保胆手术后恢复时间表（住院期至6周）、饮食调整、伤口护理、复查安排及工作恢复指导，附循证参考文献。',
    date: '2026-03-09',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260309-保胆手术后恢复指南-abugyi.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260308-胆囊切除后腹泻应对-l357rf',
    title: '胆囊切除后腹泻应对',
    titleEn: 'Managing Diarrhea After Gallbladder Removal',
    excerpt: '胆囊切除术后常见腹泻问题，科学饮食助您恢复健康。',
    excerptEn: 'Learn practical strategies to manage diarrhea and indigestion after gallbladder surgery with evidence-based dietary approaches.',
    seoTitle: '胆囊切除后腹泻怎么办？科学饮食指南',
    seoDescription: '胆囊切除术后腹泻与消化不良的应对策略，包括饮食调整、生活习惯改变及何时就医的专业建议。',
    date: '2026-03-08',
    category: '胆囊切除术后营养',
    categoryEn: 'Post-Cholecystectomy Nutrition',
    imageUrl: '/images/recovery-guide.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260307-保胆术后管理指南-3jocq5',
    title: '保胆术后管理指南',
    titleEn: 'Post-Gallbladder Preservation Surgery Management Guide',
    excerpt: '保胆手术后定期复查与长期管理是预防复发和确保手术效果的关键。',
    excerptEn: 'Regular follow-up and long-term management after gallbladder preservation surgery are crucial for preventing recurrence and ensuring successful outcomes.',
    seoTitle: '保胆手术后复查与长期管理全攻略',
    seoDescription: '了解保胆手术后的复查时间、饮食调整、药物使用及长期管理要点，预防结石复发，确保手术效果。',
    date: '2026-03-07',
    category: '保胆',
    categoryEn: 'Gallbladder Preservation',
    imageUrl: '/images/blog/blog-20260307-保胆术后管理指南-3jocq5.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260306-胆囊结石与胆囊炎-r2v9kq',
    title: '胆囊结石与胆囊炎：保胆决策与术后营养',
    titleEn: 'Gallstones and Cholecystitis: Gallbladder Preservation and Post-op Nutrition',
    excerpt: '聚焦胆囊结石与胆囊炎患者的保胆适应证、手术选择与术后营养管理，帮助患者做出更稳妥的诊疗决策。',
    excerptEn: 'A practical guide to gallstones and cholecystitis covering gallbladder preservation, surgery selection, and post-op nutrition for patient-centered decisions.',
    seoTitle: '胆囊结石与胆囊炎怎么选？保胆与术后营养要点',
    seoDescription: '围绕胆囊结石与胆囊炎，系统梳理保胆适应证、手术时机与胆囊切除后1-3个月饮食管理及就医警示信号。',
    date: '2026-03-06',
    category: '胆囊结石',
    categoryEn: 'Gallstones',
    imageUrl: '/images/blog/blog-20260306-胆囊结石与胆囊炎-2.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '20260305-蔬果农药与胆囊健康-olrmws',
    title: '蔬果农药与胆囊健康',
    titleEn: 'Pesticides in Produce and Gallbladder Health',
    excerpt: '研究显示常吃高农药残留蔬果可能影响胆道健康，如何平衡营养与安全。',
    excerptEn: 'Research links high-pesticide produce to potential gallbladder issues, balancing nutrition with safety.',
    seoTitle: '常吃蔬果却有胆囊问题？农药残留与胆道健康的关联解析',
    seoDescription: '研究显示高农药残留蔬果摄入可能增加胆道炎症风险。这篇文章帮你识别高风险品类、正确清洗减少暴露，让营养与安全兼得。',
    date: '2026-03-05',
    category: '胆囊健康',
    categoryEn: 'Gallbladder Health',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '肝硬化能逆转警惕钼元素疗法陷阱-1je8c',
    title: '肝硬化能逆转？警惕”钼元素”疗法陷阱',
    titleEn: 'Can Liver Cirrhosis Be Reversed? Beware of “Molybdenum” Therapy Traps',
    excerpt: '肝硬化真的能逆转？刘波主任带你看清”钼元素”疗法的真相 文/肝胆外科专家 刘波主任 在我的门诊里，经常能遇到一脸焦虑的肝硬化患者。他们手里拿着厚厚的检查单，眼神中透着同一个疑问：”刘主任，肝硬化真的治不好吗？我在网上看到',
    excerptEn: 'Can liver cirrhosis truly be reversed? Dr. Liu Bo exposes the truth behind “molybdenum therapy” claims — a common but misleading treatment marketed to cirrhosis patients in China.',
    seoTitle: '肝硬化能逆转？警惕”钼元素”疗法陷阱',
    seoDescription: '肝硬化能逆转吗？本文基于循证医学，解析网络热传”钼元素疗法”的常见误区，以及肝硬化患者真正应该做什么。',
    date: '2026-03-09',
    category: '肝脏健康',
    categoryEn: 'Liver Health',
    imageUrl: '/images/blog/blog-肝硬化能逆转警惕钼元素疗法陷阱-1je8c.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: '2026-03-04-cholecystectomy-diet',
    title: '切了胆囊，为什么吃点油还是难受？',
    titleEn: 'Why Does Eating Fat Still Hurt After Gallbladder Removal?',
    excerpt: '胆囊切除后仍然对油腻食物不耐受？肝胆外科医生从医学角度解析原因，并提供有文献依据的饮食建议。',
    excerptEn: 'Still struggling with fatty foods after cholecystectomy? A hepatobiliary surgeon explains the mechanism and offers evidence-based dietary advice.',
    seoTitle: '切了胆囊，为什么吃点油还是难受？',
    seoDescription: '胆囊切除后饮食怎么调？从机制、食物选择到就医指征，一文讲清术后油腻不适的应对方法。',
    date: '2026-03-04',
    category: '胆囊健康',
    categoryEn: 'Gallbladder Health',
    imageUrl: '/images/blog/blog-cholecystectomy-diet-cover.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'gallstone-prevention',
    title: '胆结石形成的原因及预防措施',
    titleEn: 'Causes of Gallstone Formation and Preventive Measures',
    excerpt: '胆结石是常见的消化系统疾病，其形成与胆固醇代谢异常、胆汁淤滞和感染等因素密切相关。了解其形成机制并采取有效的预防措施，可以显著降低患病风险。',
    excerptEn: 'Gallstones are a common digestive system disease related to cholesterol metabolism, bile stagnation, and infection. Understanding the formation mechanisms and implementing effective prevention methods can significantly reduce your risk.',
    seoTitle: '为什么会长胆结石？肝胆外科医生解析成因与预防',
    seoDescription: '哪类人最容易长胆结石？本文解析胆固醇结石形成机制，并提供5个经循证医学验证、可降低30-50%风险的实用预防建议。',
    date: '2025-03-15',
    category: '胆结石预防',
    categoryEn: 'Gallstone Prevention',
    imageUrl: '/images/blog/blog-20260326-胆囊炎并发症的识别与预防守护胆囊健康的关键指南-ggwezj.png',
    author: 'AskDrLiu.com'
  },
  {
    id: 'dietary-guidance',
    title: 'POCS手术前后的饮食指导',
    titleEn: 'Dietary Guidance Before and After POCS Surgery',
    excerpt: '胆囊结石经过POCS（经口胆道镜）手术治疗后，合理的饮食指导对患者康复至关重要。手术后的饮食调整不仅能帮助伤口愈合，还能减轻消化系统负担，预防结石复发。',
    excerptEn: 'After treating gallstones with POCS (Peroral Cholangioscopy) surgery, proper dietary guidance is crucial for patient recovery. Post-surgical dietary adjustments not only help wound healing but also reduce the burden on the digestive system.',
    seoTitle: 'POCS保胆手术前后怎么吃？分阶段饮食康复指南',
    seoDescription: 'POCS保胆取石手术前后该怎么吃？从术前轻食、术后流质到恢复均衡饮食，肝胆外科医生给出分阶段实用饮食指南。',
    date: '2025-02-22',
    category: '饮食指导',
    categoryEn: 'Dietary Guidance',
    imageUrl: '/images/dietary-guidance.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'liver-health',
    title: '肝胆健康的自我监测方法',
    titleEn: 'Self-monitoring Methods for Hepatobiliary Health',
    excerpt: '肝胆问题早期识别对治疗效果至关重要。通过观察皮肤、眼睛颜色变化、消化状况及定期体检，可及早发现肝胆异常信号。',
    excerptEn: 'Early recognition of hepatobiliary problems is crucial. By observing skin and eye color changes, digestive symptoms, and regular checkups, abnormal signals can be detected early.',
    seoTitle: '肝胆健康的自我监测方法',
    seoDescription: '从日常症状观察到体检节奏，整理一套可执行的肝胆健康自我监测清单。',
    date: '2025-01-30',
    category: '肝胆健康',
    categoryEn: 'Hepatobiliary Health',
    imageUrl: '/images/liver-health.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'recovery-guide',
    title: '术后康复指南：如何加速恢复',
    titleEn: 'Post-operative Rehabilitation Guide: How to Accelerate Recovery',
    excerpt: 'POCS手术具有微创优势，但术后康复仍需科学指导。本文介绍活动强度调整、饮食管理、并发症观察和心理调适，帮助患者更稳地恢复。',
    excerptEn: 'POCS surgery is minimally invasive, but post-operative recovery still needs a structured plan. This guide covers activity progression, diet management, warning signs, and mental adjustment.',
    seoTitle: '术后康复指南：如何加速恢复',
    seoDescription: '覆盖术后活动、饮食与复查节奏的实用康复指南，帮助患者减少并发症并平稳恢复。',
    date: '2025-01-10',
    category: '术后护理',
    categoryEn: 'Post-operative Care',
    imageUrl: '/images/recovery-guide.jpg',
    author: 'AskDrLiu.com'
  },
  {
    id: 'pocs-vs-traditional',
    title: 'POCS技术与传统手术的对比',
    titleEn: 'Comparison between POCS Technology and Traditional Surgery',
    excerpt: 'POCS技术作为一种先进的微创治疗手段，相比传统开腹手术有哪些优势？本文从创伤程度、恢复时间、并发症风险等方面进行详细对比分析。',
    excerptEn: 'As an advanced minimally invasive treatment method, what advantages does POCS technology have compared to traditional open surgery? This article provides a detailed comparative analysis in terms of trauma degree, recovery time, and complication risk.',
    seoTitle: 'POCS保胆取石 vs 传统切胆手术：该怎么选？',
    seoDescription: '保胆取石还是直接切胆？肝胆外科医生对比POCS与传统手术的创伤程度、恢复时间与并发症风险，帮助患者做出清醒决策。',
    date: '2025-01-05',
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  }
];

// 获取所有分类
export const blogCategories = (isEnglish: boolean): string[] => {
  const categorySet = new Set<string>();
  blogPosts.forEach(post => {
    categorySet.add(isEnglish ? post.categoryEn : post.category);
  });
  return Array.from(categorySet);
};

// 根据ID获取文章
export const getBlogPostById = (id: string): BlogPost | undefined => {
  return blogPosts.find(post => post.id === id);
};

// 根据分类过滤文章
export const getBlogPostsByCategory = (category: string, isEnglish: boolean): BlogPost[] => {
  return blogPosts.filter(post => {
    return isEnglish ? post.categoryEn === category : post.category === category;
  });
};

// 搜索文章
export const searchBlogPosts = (query: string, isEnglish: boolean): BlogPost[
  {
    id: '20260412-胆囊炎的保守治疗哪些情况可以暂时不手术-iarifo',
    title: '# 胆囊炎必须马上手术吗？',
    titleEn: '# 胆囊炎必须马上手术吗？',
    excerpt: 'title: 胆囊炎的保守治疗：哪些情况可以暂时不手术？titleEn: Conservative Management of Cholecystitis: W',
    excerptEn: 'title: 胆囊炎的保守治疗：哪些情况可以暂时不手术？titleEn: Conservative Management of Cholecystitis: W',
    date: '2026-04-12',
    category: '胆结石预防',
    categoryEn: 'Gallstone Prevention',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  }
  {
    id: 'gallbladder-preservation-mnwhyhpj',
    title: '保胆取石手术的适应症与长期效果',
    titleEn: '保胆取石手术的适应症与长期效果',
    excerpt: '胆囊切除术曾是治疗胆结石的标准方法，但随着技术的发展，保胆取石成为越来越多患者和医生的选择。保胆手术能否实施，需要综合考虑结石类型、胆囊功能、复发风险等因素。本',
    excerptEn: '胆囊切除术曾是治疗胆结石的标准方法，但随着技术的发展，保胆取石成为越来越多患者和医生的选择。保胆手术能否实施，需要综合考虑结石类型、胆囊功能、复发风险等因素。本',
    date: '2026-04-13',
    category: '技术介绍',
    categoryEn: 'Technology Introduction',
    imageUrl: '/images/pocs-surgery.jpg',
    author: 'AskDrLiu.com'
  }] => {
  const lowerQuery = query.toLowerCase();
  return blogPosts.filter(post => {
    const title = isEnglish ? post.titleEn.toLowerCase() : post.title.toLowerCase();
    const excerpt = isEnglish ? post.excerptEn.toLowerCase() : post.excerpt.toLowerCase();
    const category = isEnglish ? post.categoryEn.toLowerCase() : post.category.toLowerCase();
    return title.includes(lowerQuery) ||
           excerpt.includes(lowerQuery) ||
           category.includes(lowerQuery);
  });
};

// 搜索文章
