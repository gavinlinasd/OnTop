class CreateKeywordsCategories < ActiveRecord::Migration
  def up
    create_table :categories_keywords, :id => false do |t|
      t.references :category
      t.references :keyword
    end
  end

  def down
    drop_table :categories_keywords
  end
end
