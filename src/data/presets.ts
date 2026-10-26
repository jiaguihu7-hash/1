export interface PresetList {
  id: string;
  name: string;
  category: string;
  description: string;
  count: number;
  content: string;
}

export const PRESET_WORD_LISTS: PresetList[] = [
  {
    id: 'cet4-core',
    name: '大学英语四级核心词汇',
    category: '英语考试',
    description: '四级考试高频动词与形容词精选，听力与写作核心',
    count: 20,
    content: `abandon /ə'bændən/ v. 放弃，抛弃
acknowledge /ək'nɒlɪdʒ/ v. 承认，确认收到
acquire /ə'kwaɪə/ v. 获得，学到
adequate /'ædɪkwət/ adj. 足够的，充分的
alternative /ɔːl'tɜːnətɪv/ n. 供选择的对象 adj. 备选的
barrier /'bæriə/ n. 障碍，屏障
campaign /kæm'peɪn/ n. 战役，运动 v. 发起运动
capacity /kə'pæsəti/ n. 容量，能力
cease /siːs/ v. 停止，终了
collapse /kə'læps/ v. 倒塌，崩溃
compensate /'kɒmpenseɪt/ v. 赔偿，补偿
crucial /'kruːʃl/ adj. 关键的，决定性的
demonstrate /'demənstreɪt/ v. 论证，说明
diminish /dɪ'mɪnɪʃ/ v. 减少，减小
distinguish /dɪ'stɪŋɡwɪʃ/ v. 区分，辨别
encounter /ɪn'kaʊntə/ v. 偶遇，遭遇
evaluate /ɪ'væljueɪt/ v. 评估，评价
guarantee /ˌɡærən'tiː/ v. 保证，担保
indicate /'ɪndɪkeɪt/ v. 指出，表明
inevitable /ɪn'evɪtəbl/ adj. 不可避免的`
  },
  {
    id: 'ielts-toefl-academic',
    name: '雅思/托福学术高频词',
    category: '出国留学',
    description: '学术写作与听力核心学术词汇 (AWL)',
    count: 18,
    content: `accommodate /ə'kɒmədeɪt/ v. 提供住宿，容纳
ambiguous /æm'bɪɡjuəs/ adj. 模棱两可的
coherent /kəʊ'hɪərənt/ adj. 连贯的，条理清晰的
comprehensive /ˌkɒmprɪ'hensɪv/ adj. 全面的，综合的
contradict /ˌkɒntrə'dɪkt/ v. 反驳，与...矛盾
discrete /dɪ'skriːt/ adj. 分离的，互不相连的
empirical /ɪm'pɪrɪkl/ adj. 基于经验的，经验主义的
fluctuate /'flʌktʃueɪt/ v. 波动，起伏
hierarchy /'haɪərɑːki/ n. 等级制度，层级
hypothesis /haɪ'pɒθəsɪs/ n. 假设，假说
inevitable /ɪn'evɪtəbl/ adj. 必然的，免不了的
intrinsic /ɪn'trɪnzɪk/ adj. 内在的，固有的
manipulate /mə'nɪpjuleɪt/ v. 操纵，控制
paradigm /'pærədaɪm/ n. 范例，典范
phenomenon /fə'nɒmɪnən/ n. 现象
pragmatic /præɡ'mætɪk/ adj. 务实的，注重实际的
subsequent /'sʌbsɪkwənt/ adj. 随后的，后来的
underlie /ˌʌndə'laɪ/ v. 构成...的基础`
  },
  {
    id: 'high-school-essentials',
    name: '中高考常考重点词',
    category: '基础提分',
    description: '基础语法填空与听写核心词汇',
    count: 16,
    content: `accurate /'ækjərət/ adj. 准确的，精确的
benefit /'benɪfɪt/ n. 利益 v. 有益于
convenient /kən'viːniənt/ adj. 便利的，方便的
curious /'kjʊəriəs/ adj. 好奇的
determine /dɪ'tɜːmɪn/ v. 决定，决心
encourage /ɪn'kʌrɪdʒ/ v. 鼓励，支持
frequent /'friːkwənt/ adj. 频繁的
gradual /'ɡrædʒuəl/ adj. 逐渐的，逐步的
hesitate /'hezɪteɪt/ v. 犹豫，踌躇
influence /'ɪnfluəns/ v. 影响 n. 影响力
jealous /'dʒeləs/ adj. 嫉妒的，羡慕的
knowledgeable /'nɒlɪdʒəbl/ adj. 知识渊博的
maintain /meɪn'teɪn/ v. 维持，保持
necessary /'nesəsəri/ adj. 必要的
opportunity /ˌɒpə'tjuːnəti/ n. 机会
patient /'peɪʃnt/ adj. 有耐心的 n. 病人`
  },
  {
    id: 'daily-workplace',
    name: '职场与日常高效词',
    category: '职场口语',
    description: '邮件沟通、会议与日程常用表达',
    count: 15,
    content: `agenda /ə'dʒendə/ n. 议程，议事日程
allocate /'æləkeɪt/ v. 分配，指派
collaborate /kə'læbəreɪt/ v. 合作，协作
deadline /'dedlaɪn/ n. 截止日期
deliverable /dɪ'lɪvərəbl/ n. 可交付成果
efficient /ɪ'fɪʃnt/ adj. 高效的
feedback /'fiːdbæk/ n. 反馈，意见
objective /əb'dʒektɪv/ n. 目标 adj. 客观的
optimize /'ɒptɪmaɪz/ v. 优化，完善
prioritize /praɪ'ɒrətaɪz/ v. 优先处理
schedule /'ʃedjuːl/ n. 时间表 v. 安排
strategy /'strætədʒi/ n. 策略，战略
summary /'sʌməri/ n. 总结，概要
urgent /'ɜːdʒənt/ adj. 紧迫的，紧急的
verify /'verɪfaɪ/ v. 查实，核对`
  }
];
