class CreateKeywordsWebpages < ActiveRecord::Migration
  def up
    create_table :keywords_webpages, :id => false do |t|
      t.references :keyword
      t.references :webpage
    end
  end

  def down
    drop_table :keywords_webpages
  end
end
